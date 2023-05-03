import { MenuUIComponentHooks } from '../GUIHelpers/menuUIComponentHooks.js';
import gameManager from '../dataHandlers/gameManager.js';
import { loadPokemonListString } from '../dataHandlers/dataLoader.js';
import * as camera from '../engine/camera.js';
import { Scene } from '../scenes/Scene.js';
import * as helper from '../modules/helperFunctions.js';

import sceneManager from '../scenes/sceneManager.js';

var player1InputReady = false;
var player2InputReady = false;

export class PokeSelectScene extends Scene {
	constructor() {
		super();

		this.scene = new BABYLON.Scene(gameManager.engine);
		this.pokemonList = null;
		this.readyButton = null;
		this.advTexture = null;

		// Create UI Component Hooks. Class is defined in MenuUIComponentHooks.js to organzie UI components
		// Also allows for easy access to UI components from other functions
		this.playerUIHooks = null;
		this.oppUIHooks = null;

		// (Set up the main menu scene, such as UI elements, camera, etc.)
		camera.createCamera(this.scene, gameManager.canvas);

		gameManager.engine.displayLoadingUI = function () {};
		gameManager.engine.hideLoadingUI = function () {};
	}

	onInit() {
		super.onInit();

		getGUI(this.scene).then((loadedAdvancedTexture) => {
			this.advTexture = loadedAdvancedTexture;
			this.buildUI();
		});

		window.addEventListener('resize', function () {
			gameManager.engine.resize();
		});
	}

	buildUI() {
		super.buildUI();

		// Get "neutral" Controls from GUI
		this.pokemonList = this.advTexture.getControlByName('listTextBlock');
		this.readyButton = this.advTexture.getControlByName('readyButton');

		this.playerUIHooks = new MenuUIComponentHooks(1);
		this.oppUIHooks = new MenuUIComponentHooks(2);

		// Attach the hooks to the UI objects
		// Player Display
		this.playerUIHooks.setFetchButton(this.advTexture.getControlByName('fetch_1'));
		this.playerUIHooks.setInputBox(this.advTexture.getControlByName('giveNumber_1'));
		this.playerUIHooks.setPokemonImage(this.advTexture.getControlByName('pokemonImage_1'));
		this.playerUIHooks.setTypeSingleImage(this.advTexture.getControlByName('typeImageSingle_1'));
		this.playerUIHooks.setTypeDualImage_1(this.advTexture.getControlByName('typeImageDual1_1'));
		this.playerUIHooks.setTypeDualImage_2(this.advTexture.getControlByName('typeImageDual2_1'));
		this.playerUIHooks.setChoiceDisplay(this.advTexture.getControlByName('playerPokeDisplay'));

		// Opponent Display
		this.oppUIHooks.setFetchButton(this.advTexture.getControlByName('fetch_2'));
		this.oppUIHooks.setInputBox(this.advTexture.getControlByName('giveNumber_2'));
		this.oppUIHooks.setPokemonImage(this.advTexture.getControlByName('pokemonImage_2'));
		this.oppUIHooks.setTypeSingleImage(this.advTexture.getControlByName('typeImageSingle_2'));
		this.oppUIHooks.setTypeDualImage_1(this.advTexture.getControlByName('typeImageDual1_2'));
		this.oppUIHooks.setTypeDualImage_2(this.advTexture.getControlByName('typeImageDual2_2'));
		this.oppUIHooks.setChoiceDisplay(this.advTexture.getControlByName('opponentPokeDisplay'));

		// SETUP POKEMON LIST
		loadPokemonListString().then((listString) => {
			this.pokemonList.text = listString;
		});

		this.pokemonList.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
		this.pokemonList.resizeToFit = true;

		// HIDE READY BUTTON AND MAKE IT UNCLICKABLE UNTIL NEEDED
		// AND SET UP WHAT IT WILL DO WHEN EVENTUALLY CLICKED
		this.readyButton.alpha = 0;
		this.readyButton.isHitTestVisible = false;
		this.readyButton.onPointerClickObservable.add(function () {
			//setPokemonDataToClass(userInput);
		});

		//HIDE IMAGES UNTIL NEEDED
		this.playerUIHooks.pokemonImage.alpha = 0;
		this.playerUIHooks.typeSingleImage.alpha = 0;
		this.playerUIHooks.typeDualImage_1.alpha = 0;
		this.playerUIHooks.typeDualImage_2.alpha = 0;

		this.oppUIHooks.pokemonImage.alpha = 0;
		this.oppUIHooks.typeSingleImage.alpha = 0;
		this.oppUIHooks.typeDualImage_1.alpha = 0;
		this.oppUIHooks.typeDualImage_2.alpha = 0;

		//SETUP INPUT
		this.setupInput(this.playerUIHooks, this.readyButton, this.scene);

		this.setupInput(this.oppUIHooks, this.readyButton, this.scene);
	}

	setupInput(UIComponents, readyButton, _scene) {
		super.setupInput();
		//clear input box on focus
		UIComponents.inputBox.onFocusObservable.add(function () {
			UIComponents.inputBox.text = '';
		});

		UIComponents.inputBox.onTextChangedObservable.add(function () {
			if (UIComponents.inputBox.text.length == 3 && UIComponents.inputBox.text != 'ran') {
				//load simple pokemon data
				var temp = gameManager.loadedData.simpleMenuData[UIComponents.inputBox.text - 1];

				//set the background color
				UIComponents.choiceDisplay.background = helper.getTypeColor(temp.type[0]);

				//set the pokemon image and make it visible
				UIComponents.pokemonImage.alpha = 1;
				UIComponents.pokemonImage.source = temp.image.hires;

				//set the pokemon type image and make it visible
				if (temp.type.length == 1) {
					UIComponents.typeSingleImage.alpha = 1;
					UIComponents.typeSingleImage.source = helper.getTypeImageURL(temp.type[0]);
					UIComponents.typeDualImage_1.alpha = 0;
					UIComponents.typeDualImage_2.alpha = 0;
				} else {
					UIComponents.typeDualImage_1.alpha = 1;
					UIComponents.typeDualImage_1.source = helper.getTypeImageURL(temp.type[0]);
					UIComponents.typeDualImage_2.alpha = 1;
					UIComponents.typeDualImage_2.source = helper.getTypeImageURL(temp.type[1]);
					UIComponents.typeSingleImage.alpha = 0;
				}
			}
			// keep the pokemon image and type image hidden if the input is not a number
			else {
				UIComponents.pokemonImage.alpha = 0;
				UIComponents.choiceDisplay.background = helper.getTypeColor('normal');
				UIComponents.typeDualImage_1.alpha = 0;
				UIComponents.typeDualImage_2.alpha = 0;
				UIComponents.typeSingleImage.alpha = 0;
			}
		});
		// Add Event Listeners
		// check if input is a number and that there IS an input
		UIComponents.fetchButton.onPointerUpObservable.add(function () {
			// temp variable to hold the input - aliasing to make easier
			var inputText = UIComponents.inputBox.text;

			// if it's random, then randomize the pokemon number
			if (inputText == 'ran') {
				if (UIComponents.playerNumber == 1) {
					gameManager.userInput.pokemon1 = Math.floor(Math.random() * 904) + 1;
					player1InputReady = true;
				} else if (UIComponents.playerNumber == 2) {
					gameManager.userInput.pokemon2 = Math.floor(Math.random() * 904) + 1;
					player2InputReady = true;
				}
			}

			// if it's not random, then check if it's a number
			else if (inputText == '' || inputText == null || helper.isInt(inputText) == false) {
				//inputText.text = 'Please enter a number';
				return;
			}

			// if it's not random and it's a number, then set the pokemon number
			else {
				if (UIComponents.playerNumber == 1) {
					gameManager.userInput.pokemon1 = inputText;
					gameManager.userInput.pokemon1 = parseInt(gameManager.userInput.pokemon1, 10);
					player1InputReady = true;
				} else if (UIComponents.playerNumber == 2) {
					gameManager.userInput.pokemon2 = inputText;
					gameManager.userInput.pokemon2 = parseInt(gameManager.userInput.pokemon2, 10);
					player2InputReady = true;
				}
			}

			// IF BOTH PLAYERS ARE READY, SHOW READY BUTTON AND ALLOW IT TO BE CLICKED
			if (player1InputReady == true && player2InputReady == true) {
				readyButton.alpha = 1;
				readyButton.isHitTestVisible = true;

				readyButton.onPointerClickObservable.add(function () {
					sceneManager.loadingScene.showLoadingScreen();
					gameManager.storePokemonAPICallData(this.scene);
				});
			}
		});
	}

	onUpdate() {
		super.onUpdate();
	}

	dispose() {
		super.dispose();
		this.scene.dispose();
		this.pokemonList = null;
		this.readyButton = null;
		this.playerUIHooks = null;
		this.oppUIHooks = null;
	}
}

export async function getGUI(scene) {
	// Load from GUI snippet
	// https://gui.babylonjs.com/
	let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('GUI', true, scene);
	advancedTexture.scaleToWidth = 1376;
	advancedTexture.scaleToHeight = 768;

	return await advancedTexture.parseFromSnippetAsync('BG6JQI#19');
}
