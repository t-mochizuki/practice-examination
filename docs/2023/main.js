(() => {
  class AppElement extends HTMLDivElement {
    constructor() {
      super();

      this.innerHTML = `
<header class="header">
  <nav class="global-nav">
  </nav>
</header>

<div class="wrapper">
  <main>
    <div>
      <form>
        ${createAnswerSheet(this.dataset.total, "", this.dataset.answerSheetOnly)}
      </form>
    </div>
  </main>
</div>

<footer class="footer">
</footer>
      `
    }
  }
  customElements.define("app-div", AppElement, { extends: "div" });

  function createMultipleChoice(nth) {
    return ["ア", "イ", "ウ", "エ"].map((text, index) => {
      return `
<label>
  <input type="radio" name="question${nth}" value="${index + 1}"></input>
  ${text}
</label>
      `
    });
  }

  function createAnswerColumn(href, nth, answerSheetOnly) {
    return `
<fieldset>
  <legend>
    <a ${answerSheetOnly === 'true' ? '' : `href="${href}"`} target="_blank">問${nth}</a>
  </legend>
  ${createMultipleChoice(nth).join('')}
</fieldset>
    `
  }

  function createAnswerSheet(total, listInProgress, answerSheetOnly) {
    const answerColumns = [];
    listInProgress = listInProgress.split(",").map(i => parseInt(i));
    for (let i = 1; i <= parseInt(total); i++) {
      if (listInProgress.includes(i)) continue;
      const answerColumn = createAnswerColumn(`${i}/index.html`, i, answerSheetOnly);
      answerColumns.push(answerColumn);
    }

    return `
${answerColumns.join('')}
<input type="submit" value="Submit">
<input type="reset" value="Reset">
<output></output>
    `
  }

  const formElem = document.querySelector("form");

  formElem.onsubmit = (e) => {
    e.preventDefault();

    new FormData(formElem);
  };

  fetch(`index.json`)
    .then((response) => response.json())
    .then((data) => {
      let answers = {};
      data["answers"].forEach((elem, i) => {
        answers[`question${i+1}`] = elem["value"];
      });
      return answers;
    })
    .then((answers) => {
      const outputElem = document.querySelector("output");

      formElem.onformdata = (e) => {
        const formData = e.formData;
        let count = 0;
        formData.forEach((answer, index) => {
          if (parseInt(answer) === answers[index]) {
            count++;
          }
        })
        outputElem.value = `Your score: ${count} / ${Object.keys(answers).length}`;
      }
    });
})();
