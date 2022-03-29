const router = require("express").Router();
const User = require("../../model/User");
const History = require("../../model/History");
const {ensureAuthenticated} = require("../../config/auth");
const { ensureAdmin } = require("../../config/auth");

router.get("/", ensureAuthenticated, ensureAdmin, async (req,res) => {
    try{
        const customers = await User.find({});
        const history = await History.find({});
        const total_bal = customers.reduce((prev, cur)=> prev+Number(cur.balance), 0);
        return res.render("admin/index", {pageTitle: "Welcome", customers, history, total_bal, req});
    }
    catch(err){
        return res.redirect("/admin");
    }
});

router.get("/edit-user/:id", ensureAuthenticated, ensureAdmin, async (req,res) => {
    try{
        const {id} = req.params;
        const customer = await User.findOne({_id:id});
        return res.render("admin/editUser", {pageTitle: "Welcome", customer, req});
    }
    catch(err){
        return res.redirect("/admin");
    }
});

router.post("/edit-user/:id", ensureAuthenticated, ensureAdmin, async (req,res) => {
    try{
        const {id} = req.params;
        const {balance, pending, total_deposit, total_earned, active_deposit, total_withdraw, debt, account_plan} = req.body;
        const customer = await User.findOne({_id:id}).limit(10)
        if(!balance || !total_earned || !pending || !total_deposit || !active_deposit || !total_withdraw || !debt || !account_plan){
            req.flash("error_msg", "Please fill all fields");
            return res.render("admin/editUser", {pageTitle: "Welcome", customer, req});
        }
        await User.updateOne({_id:id}, {...req.body});
        req.flash("success_msg", "account updated");
        return res.redirect("/admin/edit-user/"+id);
    }
    catch(err){
        return res.redirect("/admin");
    }
});

router.get("/delete-account/:id", ensureAuthenticated, ensureAdmin, async (req,res) => {
    try{
        const {id} = req.params;
        if(!id){
            return res.redirect("/admin");
        }
        await User.deleteOne({_id:id});
        return res.redirect("/admin");
    }catch(err){
        return res.redirect("/")
    }
});

router.get("/deposit", ensureAuthenticated, ensureAdmin, async (req,res) => {
    try{
        const customers = await User.find({});
        return res.render("admin/deposit", {pageTitle: "Deposit", customers, req});
    }catch(err){
        return res.redirect("/")
    }
});

router.post("/deposit", ensureAuthenticated, ensureAdmin, async (req,res) => {
    try{
        const {amount, userID, debt} = req.body;
        if(!amount || !userID || !debt){
            req.flash("error_msg", "Please provide all fields");
            return res.redirect("/admin/deposit");
        }
        const customer = await User.findOne({_id: userID});
        const newHistData = {
            type: "Credit",
            userID,
            amount,
            account: customer.email
        }
        const newHist = new History(newHistData);
        await newHist.save();

        await User.updateOne({_id: userID}, {
            balance: Number(customer.balance) + Number(amount),
            active_deposit: amount,
            debt,
            total_deposit: Number(customer.total_deposit) + Number(amount)
        });

        req.flash("success_msg", "Deposit successful");
        return res.redirect("/admin/deposit");

    }catch(err){
        console.log(err);
        return res.redirect("/admin");
    }
})

module.exports = router;