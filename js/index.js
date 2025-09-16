$(document).ready(function(){
    introScreen();
    navBarSetup();
    setImageHeight();
  });
  
  function setImageHeight() {
    function setPortraitMaxHeight() {
      function getPortfolioItemBody(imageDiv) {
        var portfolioItem = null;
        imageDiv.parents().each((i, item) => {
          if ($(item).attr('class') != undefined &&
            $(item).attr('class').includes('portfolio-item')) {
            portfolioItem = item;
            return;
          }
        });
        if (portfolioItem != null) {
          return $(portfolioItem).find('.item-body');
        }
      };
  
      var portraitImages = $('img.portrait');
      portraitImages.each((i, image) => {
        itemBody = getPortfolioItemBody($(image));
        if (itemBody) {
          $(image).css('max-height', $(itemBody).outerHeight());
        }
      });
    }
    setPortraitMaxHeight();
    $(window).resize(function(){
      setPortraitMaxHeight();
    });
  };
  
  function dropNav() {
    var navBar = $('.nav-bar');
    if (!(navBar.is(':visible'))){
      navBar.slideDown();
    }
  };
  
  function introScreen() {
  
    /// Helper functions
    function blink(selector, currBlink, maxBlink, callback) {
      $(selector).fadeOut(500, function() {
        $(this).fadeIn(500, function() {
          if (currBlink != undefined && maxBlink != undefined && currBlink >= maxBlink) {
            if (callback) {
              callback();
            }
          } else {
            blink(selector, currBlink + 1, maxBlink, callback);
          }
        });
      });
    };
  
    function typeNext(selector, typed, toType, timeout=50, callback) {
      if (toType.length == 0) {
        callback();
        return;
      }
      if (toType[0] == ' ') {
        typed += '&nbsp;';
      } else {
        typed += toType[0];
      }
      toType = toType.substring(1);
      $(selector).html(typed);
      setTimeout(function(){
        typeNext(selector, typed, toType, timeout, callback);
      }, timeout);
    };
  
    function afterAnimation(delay=50) {
      dropNav();
      blink('.intro-text > .caret');
    }
  
    function typeLines(lines, typingDelay = 100, betweenLines = 1) {
      typeNext('.intro-text > .intro-message', '', lines[0], typingDelay, function() {
        if (lines.length == 1) {
          afterAnimation();
        } else {
          blink('.intro-text > .caret', 0, betweenLines, function(){
            typeLines(lines.slice(1), typingDelay, betweenLines);
          });
        }
      });
    };
    /// End Helper functions
    var introTextLines = ['Hi, I\'m Pat.', 'Welcome to my website!'];
  
    blink('.intro-text > .caret', 0, 1, function(){
      typeLines(introTextLines, 200, 0);
    });
  };
  
  function exitButton() {
    return $('<div/>', {'class': 'exit'})
      .append($('<div/>', {'class': 'exit-button'})
          .html('&#10006;'));
  }
  
  //// End Persons boxes ////
  //// Nav-bar setup ////
  function sideNavToggle(closeOnly){
    var sideNav = $('.side-nav');
    if (sideNav.is(':visible') || closeOnly == true) {
      sideNav.animate({
        width: '0%'
      }, function (){
        sideNav.removeClass('active');
      });
    } else {
      sideNav.addClass('active');
      sideNav.animate({
        width: '33%'
      });
    }
  }
  
  function navBarSetup() {
    function navItemsListen() {
      $('.nav-item').click(function(){
        var scrollTo = '.section#' + $(this).data('scroll-to');
        var offset = $(scrollTo).offset().top - 130;
        $('html, body').animate({
          scrollTop: offset
        }, 1000);
        sideNavToggle(true);
      })
    };
  
    function navBrandListen() {
      $('.nav-brand').click(function(){
        $('html, body').animate({
          scrollTop: 0
        }, 1000);
      });
    };
  
    function navbarMenuListen() {
      // This function depends on setupSideBar() below
      var sideNav = $('.side-nav');
      var lastSize = $(window).width();
      $(window).resize(function(){
        if ($(window).width() > 768 && lastSize <= 768) {
          sideNavToggle(true);
        }
  
        lastSize = $(window).width();
      });
      sideNav.find('.exit-button').click(function() {
        sideNavToggle(true);
      });
      $('.menu-button').click(function(){
        sideNavToggle();
      });
    };
  
    function setupSideBar() {
      var sideNav = $('.side-nav');
      var navItems = $('.nav-item').clone();
      var reorderedNavItems = [];
      var resumeItem = null;
      navItems.each((i, item) => {
        if ($(item).attr('id') && $(item).attr('id').includes('resume')) {
          resumeItem = $(item).clone();
        } else {
          reorderedNavItems.push(item);
        }
      });
      if (resumeItem != null) {
        reorderedNavItems.push(resumeItem);
      }
      sideNav.append(exitButton());
      sideNav.append(reorderedNavItems);
    };
  
    function listenNav() {
      $(window).scroll(function(){
        var offset_y = window.scrollY;
        if (offset_y > 400){
          dropNav();
        };
      });
    };
  
    listenNav();
    setupSideBar();
    navbarMenuListen();
    navItemsListen();
    navBrandListen();
  };