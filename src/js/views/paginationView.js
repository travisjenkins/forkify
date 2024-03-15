import View from "./View.js";
import icons from "url:../../img/icons.svg";

class PaginationView extends View {
  _parentElement = document.querySelector(".pagination");

  addHandlerClick(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--inline");

      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _generateNextBtn(currentPage, pageInfo = "") {
    return (
      pageInfo +
      `
        <button data-goto="${
          currentPage + 1
        }" class="btn--inline pagination__btn--next">
            <span>Next</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>
      `
    );
  }

  _generatePrevBtn(currentPage, pageInfo = "") {
    return (
      `
        <button data-goto="${
          currentPage - 1
        }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Prev</span>
        </button>
      ` + pageInfo
    );
  }

  _generateAllBtns(currentPage, pageInfo) {
    return (
      this._generatePrevBtn(currentPage) +
      pageInfo +
      this._generateNextBtn(currentPage)
    );
  }

  _generateMarkup() {
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    const currentPage = this._data.page;
    const pageInfo = `<div class="pagination__pages">${currentPage} of ${numPages}</div>`;
    // Page 1, and there are other pages
    if (currentPage === 1 && numPages > 1) {
      if (this._parentElement.classList.contains("pagination__all"))
        this._parentElement.classList.remove("pagination__all");
      if (this._parentElement.classList.contains("pagination__noNext"))
        this._parentElement.classList.remove("pagination__noNext");
      this._parentElement.classList.add("pagination__noPrev");
      return this._generateNextBtn(currentPage, pageInfo);
    }
    // Last page
    if (currentPage === numPages && numPages > 1) {
      if (this._parentElement.classList.contains("pagination__all"))
        this._parentElement.classList.remove("pagination__all");
      if (this._parentElement.classList.contains("pagination__noPrev"))
        this._parentElement.classList.remove("pagination__noPrev");
      this._parentElement.classList.add("pagination__noNext");
      return this._generatePrevBtn(currentPage, pageInfo);
    }
    // Other page
    if (currentPage < numPages) {
      if (this._parentElement.classList.contains("pagination__noPrev"))
        this._parentElement.classList.remove("pagination__noPrev");
      if (this._parentElement.classList.contains("pagination__noNext"))
        this._parentElement.classList.remove("pagination__noNext");
      this._parentElement.classList.add("pagination__all");
      return this._generateAllBtns(currentPage, pageInfo);
    }
    // Page 1, and there are no other pages
    return "";
  }
}

export default new PaginationView();
