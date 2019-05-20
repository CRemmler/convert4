(function() {
  // (DOMElement, Array[{ text: String, url: String }]) => Unit
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
      links.forEach(function({text, url}) {
        var anchor, clone;
        clone = document.importNode(template.content, true);
        anchor = clone.querySelector(".topbar-hint-link");
        anchor.innerText = text;
        anchor.href = url;
        return listElem.appendChild(clone);
      });
      hintBox.style.left = `${(topbarElem.getBoundingClientRect().left)}px`;
      hintBox.style.display = 'block';
    } else {
      hintBox.style.display = 'none';
    }
  };

  window.addEventListener('click', function({target}) {
    var hintBox;
    hintBox = document.querySelector('.topbar-hint-box');
    if (!(target.classList.contains('topbar-label') || hintBox.contains(target))) {
      hintBox.style.display = 'none';
    }
  });

  window.addEventListener('load', function() {
    var authoringLink, differencesLink, docHintInfo, faqLink, relativizer;
    relativizer = window.location.pathname.includes('/docs/') ? "." : "./docs";
    authoringLink = {
      text: "Authoring",
      url: `${relativizer}/authoring`
    };
    differencesLink = {
      text: "What's Different?",
      url: `${relativizer}/differences`
    };
    faqLink = {
      text: "FAQ",
      url: `${relativizer}/faq`
    };
    docHintInfo = {
      elemID: 'docs-label',
      links: [authoringLink, differencesLink, faqLink]
    };
    return [docHintInfo].forEach(function({elemID, links}) {
      var elem;
      elem = document.getElementById(elemID);
      return elem.addEventListener('click', (function() {
        return setHintBox(elem, links);
      }));
    });
  });

}).call(this);

//# sourceMappingURL=topbar.js.map
