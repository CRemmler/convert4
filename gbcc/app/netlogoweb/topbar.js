(function() {
  var setHintBox;

  setHintBox = function(topbarElem, links) {
    var hintBox, listElem, template;
    hintBox = document.querySelector('.topbar-hint-box');
    if (getComputedStyle(hintBox).display === 'none') {
      listElem = document.querySelector('.topbar-hint-list');
      while (listElem.lastChild) {
        listElem.removeChild(listElem.lastChild);
      }
      template = document.querySelector('#hint-list-entry');
      links.forEach(function(arg) {
        var anchor, clone, text, url;
        text = arg.text, url = arg.url;
        clone = document.importNode(template.content, true);
        anchor = clone.querySelector(".topbar-hint-link");
        anchor.innerText = text;
        anchor.href = url;
        return listElem.appendChild(clone);
      });
      hintBox.style.left = (topbarElem.getBoundingClientRect().left) + "px";
      hintBox.style.display = 'block';
    } else {
      hintBox.style.display = 'none';
    }
  };

  window.addEventListener('click', function(arg) {
    var hintBox, target;
    target = arg.target;
    hintBox = document.querySelector('.topbar-hint-box');
    if (!(target.classList.contains('topbar-label') || hintBox.contains(target))) {
      hintBox.style.display = 'none';
    }
  });

  window.addEventListener('load', function() {
    var authoringLink, differencesLink, docHintInfo, faqLink, relativizer;
    relativizer = window.location.pathname.includes('/docs/') ? "" : "../";
    authoringLink = {
      text: "Authoring",
      url: "./" + relativizer + "docs/authoring"
    };
    differencesLink = {
      text: "What's Different?",
      url: "./" + relativizer + "docs/differences"
    };
    faqLink = {
      text: "FAQ",
      url: "./" + relativizer + "docs/faq"
    };
    docHintInfo = {
      elemID: 'docs-label',
      links: [authoringLink, differencesLink, faqLink]
    };
    return [docHintInfo].forEach(function(arg) {
      var elem, elemID, links;
      elemID = arg.elemID, links = arg.links;
      elem = document.getElementById(elemID);
      return elem.addEventListener('click', (function() {
        return setHintBox(elem, links);
      }));
    });
  });

}).call(this);

//# sourceMappingURL=topbar.js.map
