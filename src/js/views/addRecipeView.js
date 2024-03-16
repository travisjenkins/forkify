import View from "./View.js";
import recipeView from "./recipeView.js";

class AddRecipeView extends View {
  _parentElement = document.querySelector(".upload");
  _message = "Recipe was successfully uploaded";
  _overlay = document.querySelector(".overlay");
  _window = document.querySelector(".add-recipe-window");
  _btnOpen = document.querySelector(".nav__btn--add-recipe");
  _btnClose = document.querySelector(".btn--close-modal");

  _allRecipeDataErrorLabels = [
    document.querySelector(".error-title"),
    document.querySelector(".error-sourceUrl"),
    document.querySelector(".error-image"),
    document.querySelector(".error-publisher"),
    document.querySelector(".error-cookingTime"),
    document.querySelector(".error-servings"),
  ];
  _recipeDataValidationErrors = {};

  _btnAddIngredient = document.querySelector(".upload__btn--add-ingredient");
  _addIngredientsList = document.querySelector(".upload__ingredients__list");
  _ingredients = [];

  _allIngredientErrorLabels = [
    document.querySelector(".error-ingredients"),
    document.querySelector(".error-quantity"),
    document.querySelector(".error-unit"),
    document.querySelector(".error-description"),
  ];
  _ingredientValidationErrors = {};

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  toggleWindow() {
    this._overlay.classList.toggle("hidden");
    this._window.classList.toggle("hidden");
    this._clearRecipeDataErrors();
    this._clearIngredientErrors();
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
      const newIngredient = Object.fromEntries(dataArr);
      // Send to controller for validation & html generation
      handler(inputArr, newIngredient);
    });
  }

  addHandlerUpload(handler) {
    const ingredients = this._ingredients;
    this._parentElement.addEventListener("submit", function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const newRecipe = Object.fromEntries(dataArr);
      newRecipe.ingredients = ingredients;
      handler(dataArr, newRecipe);
    });
  }

  isValidRecipe(dataArr) {
    function isValidUrl(str) {
      try {
        const newUrl = new URL(str);
        return newUrl.protocol === "http:" || newUrl.protocol === "https:";
      } catch {
        return false;
      }
    }

    let isValid = true;
    this._clearRecipeDataErrors();
    this._clearIngredientErrors();

    dataArr.forEach((elm) => {
      if (elm[0] === "title" && !elm[1]) {
        this._recipeDataValidationErrors.title = "Title is required.";
      }
      if (elm[0] === "sourceUrl" && !elm[1]) {
        this._recipeDataValidationErrors.sourceUrl = "URL is required.";
      } else if (elm[0] === "sourceUrl" && !isValidUrl(elm[1])) {
        this._recipeDataValidationErrors.sourceUrl = "A valid URL is required.";
      }
      if (elm[0] === "image" && !elm[1]) {
        this._recipeDataValidationErrors.image = "Image URL is required.";
      } else if (elm[0] === "image" && !isValidUrl(elm[1])) {
        this._recipeDataValidationErrors.image = "A valid URL is required.";
      }
      if (elm[0] === "publisher" && !elm[1]) {
        this._recipeDataValidationErrors.publisher = "Publisher is required";
      }
      if (elm[0] === "cookingTime" && !elm[1]) {
        this._recipeDataValidationErrors.cookingTime = "Prep time is required";
      }
      if (elm[0] === "servings" && !elm[1]) {
        this._recipeDataValidationErrors.servings = "Servings is required";
      }
    });

    if (Object.keys(this._recipeDataValidationErrors).length > 0) {
      isValid = false;
      this._displayRecipeDataErrorMessages(dataArr);
    }

    if (this._ingredients.length === 0) {
      isValid = false;
      const errorNode = document.createTextNode(
        "You must add at least one ingredient."
      );
      const errorLabel = document.querySelector(".error-ingredients");
      errorLabel.appendChild(errorNode);
      if (errorLabel.classList.contains("hidden"))
        errorLabel.classList.remove("hidden");
    }
    return isValid;
  }

  _generateMarkup() {}

  addIngredient(inputArr, newIngredient) {
    // Clear any previous error messages
    this._clearIngredientErrors();
    // Check input validity
    this._isValidIngredient(newIngredient)
      ? this._addIng(inputArr, newIngredient)
      : this._displayIngredientErrorMessages(inputArr);
  }

  _addIng(inputArr, newIngredient) {
    // Clear input values
    inputArr.forEach((elm) =>
      elm.name?.includes("ingredient") ? (elm.value = "") : ""
    );
    // Focus back on first ingredient input element
    inputArr.at(0).focus();
    // Add ingredient to list and display
    this._ingredients.push({
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      description: newIngredient.description,
    });
    this._addIngredientsList.insertAdjacentHTML(
      "beforeend",
      recipeView.generateMarkupIngredient(newIngredient)
    );
  }

  _displayIngredientErrorMessages(inputArr) {
    inputArr.forEach((elm) => {
      if (elm.name?.includes("ingredient")) {
        const ingInputName = elm.name.split("-")[1];
        if (
          Object.keys(this._ingredientValidationErrors).includes(ingInputName)
        ) {
          const errorMessage = document.createTextNode(
            this._ingredientValidationErrors[ingInputName]
          );
          const errorLabel = document.querySelector(`.error-${ingInputName}`);
          errorLabel.appendChild(errorMessage);
          if (errorLabel.classList.contains("hidden"))
            errorLabel.classList.remove("hidden");
        }
      }
    });
  }

  _displayRecipeDataErrorMessages(dataArr) {
    dataArr.forEach((elm) => {
      if (Object.keys(this._recipeDataValidationErrors).includes(elm[0])) {
        const errorMessage = document.createTextNode(
          this._recipeDataValidationErrors[elm[0]]
        );
        const errorLabel = document.querySelector(`.error-${elm[0]}`);
        errorLabel.appendChild(errorMessage);
        if (errorLabel.classList.contains("hidden"))
          errorLabel.classList.remove("hidden");
      }
    });
  }

  _clearRecipeDataErrors() {
    if (Object.keys(this._recipeDataValidationErrors).length !== 0)
      this._recipeDataValidationErrors = {};

    this._hideRecipeDataErrorLabels();
    this._clearRecipeDataErrorMessages();
  }

  _hideRecipeDataErrorLabels() {
    this._allRecipeDataErrorLabels.forEach((lbl) => {
      if (!lbl.classList.contains("hidden")) lbl.classList.add("hidden");
    });
  }

  _clearRecipeDataErrorMessages() {
    this._allRecipeDataErrorLabels.forEach((lbl) => (lbl.innerHTML = ""));
  }

  _clearIngredientErrors() {
    if (Object.keys(this._ingredientValidationErrors).length !== 0)
      this._ingredientValidationErrors = {};

    this._hideIngredientErrorLabels();
    this._clearIngredientErrorMessages();
  }

  _hideIngredientErrorLabels() {
    this._allIngredientErrorLabels.forEach((lbl) => {
      if (!lbl.classList.contains("hidden")) lbl.classList.add("hidden");
    });
  }

  _clearIngredientErrorMessages() {
    this._allIngredientErrorLabels.forEach((lbl) => (lbl.innerHTML = ""));
  }

  _isValidIngredient(newIngredient) {
    let isValid = true;
    if (newIngredient.quantity && parseFloat(newIngredient.quantity) <= 0) {
      isValid = false;
      this._ingredientValidationErrors.quantity =
        "You must provide a positive decimal value.";
    }
    if (newIngredient.quantity && !newIngredient.unit) {
      isValid = false;
      this._ingredientValidationErrors.unit =
        "Unit of measure is required when adding a quantity.";
    }
    if (!newIngredient.description) {
      isValid = false;
      this._ingredientValidationErrors.description = "Description is required.";
    }
    return isValid;
  }
}

export default new AddRecipeView();
