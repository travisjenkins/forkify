import View from "./View.js";
import recipeView from "./recipeView.js";

class AddRecipeView extends View {
  _parentElement = document.querySelector(".upload");
  _message = "Recipe was successfully uploaded";
  _overlay = document.querySelector(".overlay");
  _window = document.querySelector(".add-recipe-window");
  _btnOpen = document.querySelector(".nav__btn--add-recipe");
  _btnClose = document.querySelector(".btn--close-modal");
  _btnAddIngredient = document.querySelector(".upload__btn--add-ingredient");
  _addIngredientsList = document.querySelector(".upload__ingredients__list");
  _ingredients = [];
  _lbl_ing_error = document.querySelector(".error-ingredients");
  _lbl_qty_error = document.querySelector(".error-quantity");
  _lbl_unit_error = document.querySelector(".error-unit");
  _lbl_desc_error = document.querySelector(".error-description");
  _validationErrors = {};

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  toggleWindow() {
    this._overlay.classList.toggle("hidden");
    this._window.classList.toggle("hidden");
  }

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener("click", this.toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener("click", this.toggleWindow.bind(this));
    this._overlay.addEventListener("click", this.toggleWindow.bind(this));
  }

  addHandlerAddIngredient(handler) {
    this._btnAddIngredient.addEventListener("click", function (e) {
      e.preventDefault();
      // Get ingredient inputs
      const inputArr = Array.from(this.parentElement.children).filter((elm) =>
        elm.name?.includes("ingredient")
      );
      // Create an array similar to a FormData array for object creation
      const dataArr = inputArr.map((inp) => [
        inp.name.split("-").at(1),
        inp.value,
      ]);
      // Create the object with the current values
      const ingredient = Object.fromEntries(dataArr);
      // Send to controller for validation & html generation
      handler(inputArr, ingredient);
    });
  }

  addHandlerUpload(handler) {
    const ingredients = this._ingredients;
    this._parentElement.addEventListener("submit", function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      data.ingredients = ingredients;
      handler(data);
    });
  }

  hasIngredients() {
    this._clearErrorLabels();
    if (this._ingredients.length === 0) return false;
    const errorNode = document.createTextNode(
      "You must add at least one ingredient."
    );
    this._lbl_ing_error.appendChild(errorNode);
    return true;
  }

  _generateMarkup() {}

  addIngredient(inputArr, ing) {
    // Clear any previous error messages
    this._clearErrorLabels();
    // Check input validity
    this._isValidIngredient(ing)
      ? this._addIng(inputArr, ing)
      : this._displayErrorMessages(inputArr);
  }

  _addIng(inputArr, ing) {
    // Clear input values
    inputArr.forEach((elm) =>
      elm.name?.includes("ingredient") ? (elm.value = "") : ""
    );
    // Focus back on first ingredient input element
    inputArr.at(0).focus();
    // Add ingredient to list and display
    this._ingredients.push({
      quantity: ing.quantity,
      unit: ing.unit,
      description: ing.description,
    });
    this._addIngredientsList.insertAdjacentHTML(
      "beforeend",
      recipeView.generateMarkupIngredient(ing)
    );
  }

  _displayErrorMessages(inputArr) {
    inputArr.forEach((elm) => {
      if (elm.name?.includes("ingredient")) {
        const ingInputName = elm.name.split("-")[1];
        if (Object.keys(this._validationErrors).includes(ingInputName)) {
          const errorMessage = document.createTextNode(
            this._validationErrors[ingInputName]
          );
          document
            .querySelector(`.error-${ingInputName}`)
            .appendChild(errorMessage);
        }
      }
    });
  }

  _clearErrorLabels() {
    this._lbl_ing_error.innerHTML = "";
    this._lbl_qty_error.innerHTML = "";
    this._lbl_unit_error.innerHTML = "";
    this._lbl_desc_error.innerHTML = "";
  }

  _isValidIngredient(ing) {
    let isValid = true;
    if (ing.quantity && parseFloat(ing.quantity) < 0) {
      isValid = false;
      this._validationErrors.quantity =
        "You must provide a positive decimal value.";
    }
    if (ing.quantity && !ing.unit) {
      isValid = false;
      this._validationErrors.unit =
        "Unit of measure is required when adding a quantity.";
    }
    if (!ing.description) {
      isValid = false;
      this._validationErrors.description = "Description is required.";
    }
    return isValid;
  }
}

export default new AddRecipeView();
