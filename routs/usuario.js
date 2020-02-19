const expresss = require('express');
const router = expresss.Router();
const mongoose = require('mongoose');
require("../model/Ususrio");
const Usuario = mongoose.model("usuarios")
const bcrypt = require('bcryptjs');
const passport = require('passport')


router.get("/registro",(req, res) =>{
    res.render("../views/usuarios/registro");
});
router.post("/registro",(req, res) =>{
    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto:"Nome inválido "});
    }
    
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto:"E-mail inválido "});
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto:"Senha inválido "});
    }

    if (req.body.senha.length < 4){
        erros.push({texto:"Senha muito curta"});
    }
    
    if (req.body.senha != req.body.senha2){
        erros.push({texto:"A senha não corresponde!!"});
    }

    if(erros.length > 0){
        res.render("usuarios/registro",{erros: erros});        
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) =>{
            if(usuario){
             req.flash("error_msg","Jé existe uma conta com esse E-mail em nosso sistema ");
             res.redirect("/usuarios/registro");   
            }else{
                const novoUsuario = new Usuario({
                    nome:req.body.nome,
                    email:req.body.email,
                    senha:req.body.senha
                })
                bcrypt.genSalt(10, (erro,salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt,(erro,hash) =>{
                      if(erro){  
                        req.flash("error_msg","Houve um erro durante o salvamento");
                        res.redirect("/")
                      }

                      novoUsuario.senha = hash

                      novoUsuario.save().then(() => {
                          req.flash("success_msg","Usuário criado com sucesso!")
                          res.redirect("/")
                      }).catch((erro) => {
                          req.flash("error_msg","Houve um erro ao criar usuário");
                          res.redirect("/usuarios/registro")
                          //56 11:08
                      })

                    })
                })
            }
        }).catch((erro) => {

            console.log(erro);
            
            req.flash("error_msg","Houve um erro interno");
            res.redirect("/usuario/registro");
        })
    }
});

router.get("/login",(req,res) =>{
    res.render("usuarios/login")
});

router.post("/login",(req,res,next) =>{

    passport.authenticate("local",{
        successRedirect:"/",
        failureRedirect: "/usuarios/login",
        failureFlash:true,
    })(req,res,next)
})
router.get("/logout",(req,res) =>{
    req.logOut()
    res.redirect("/");
})
module.exports = router;