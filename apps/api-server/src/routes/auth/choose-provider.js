const express = require('express');
const bruteForce = require('../../middleware/brute-force');
const authSettings = require('../../util/auth-settings');
const db = require('../../db');
const {Op} = require('sequelize');
const nunjucks          = require('nunjucks');
const { resolve } = require('node:path');


let router = express.Router({mergeParams: true});

// brute force
router.use( bruteForce.globalMiddleware );
router.post( '*', bruteForce.postMiddleware );

router
  .use(async function (req, res, next) {
    // if query param "authProvider" is set, use that as the auth provider
    const authProviderIds = req.project.config.authProviders.filter(provider => provider != "openstad").map(provider => parseInt(provider, 10));
    const allowOpenStad = req.project.config.authProviders.filter(provider => provider == "openstad").length > 0;
    
    let useAuthProvider = req.query.authProvider;
    
    if (useAuthProvider) {
      
      if (authProviderIds.includes(parseInt(useAuthProvider, 10)) || (allowOpenStad && useAuthProvider == "openstad")) {
        // set a cookie to remember the auth provider
        res.cookie('useAuthProvider', useAuthProvider, {
          path: '/',
          httpOnly: true,
          secure: true,
        });
        console.log('choose-provider middleware, useAuthProvider set to', useAuthProvider);
        
        const returnTo = process.env.URL + req.query.returnTo;
        
        console.log ('provider chosen', useAuthProvider, 'returnTo', returnTo, req.cookies['useAuthProvider']);
        
        return res.redirect(returnTo);
      }
      
      console.error('choose-provider middleware, useAuthProvider', useAuthProvider, authProviderIds, allowOpenStad);
      const currentUrl = req.originalUrl;
      return res.redirect('/auth/project/' + req.project.id + '/choose-provider?returnTo=' + encodeURIComponent(currentUrl));
    }
    
    return next();
    
    
  })
  .use(async function (req, res, next) {
    // get auth providers from project config
    console.log ('ch2ooose, req.project', req.project);
    const authProviderIds = req.project.config.authProviders.filter(provider => provider != "openstad").map(provider => parseInt(provider, 10));
    const allowOpenStad = req.project.config.authProviders.filter(provider => provider == "openstad").length > 0;
    let isPriviligedRoute = !!req.params.priviligedRoute || false;
    
    console.log ('choose', authProviderIds);
    
    const authProviders = await db.AuthProvider.findAll({ where: { id: { [Op.in]: authProviderIds}} });
    
    console.log ('choo2ss2e2', authProviders, allowOpenStad);
    
    nunjucks.configure(resolve(__dirname,'../../views'), {
    autoescape: true,});
    
    let currentUrl = req.originalUrl;
    
    if (currentUrl.indexOf('?') !== -1) {
      currentUrl += '&';
    } else {
      currentUrl += '?';
    }
    
    const renderedResponse = nunjucks.render('auth/choose-provider.html', {
      authProviders: authProviders,
      allowOpenStad: allowOpenStad,
      currentUrl: currentUrl,
      authUrl: process.env.AUTH_ADAPTER_OPENSTAD_SERVERURL,
      isPriviligedRoute: isPriviligedRoute,
      project: req.project,
    });
    
    // Send the renderedResponse as HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    return res.send(renderedResponse);
  });


module.exports = router;
