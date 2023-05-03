import { MenuUIComponentHooks } from '../GUIHelpers/menuUIComponentHooks.js';
import { loadMoveListString } from '../dataHandlers/dataLoader.js';
import * as camera from '../engine/camera.js';
import { Scene } from '../scenes/Scene.js';
import * as helper from '../modules/helperFunctions.js';

import sceneManager from '../scenes/sceneManager.js';

import gameManager from '../dataHandlers/gameManager.js';

export class MoveSelectScene extends Scene {
	constructor() {
		super();
		this.scene = new BABYLON.Scene(gameManager.engine);

		this.readyButton = null;
		this.uiComponents = null;
		this.movesToBeTaught = [];
		this.advTexture = null;

		gameManager.engine.displayLoadingUI = function () {};
		gameManager.engine.hideLoadingUI = function () {};

		// (Set up the main menu scene, such as UI elements, camera, etc.)
		camera.createCamera(this.scene, gameManager.canvas);
	}

	onInit() {
		super.onInit();

		getGUI(this.scene).then((loadedAdvancedTexture) => {
			this.advTexture = loadedAdvancedTexture;
			this.buildUI(this.engine, this.canvas);

			window.addEventListener('resize', function () {
				gameManager.engine.resize();
			});

			// set the active scene to the moveSelect scene
			sceneManager.setActiveScene(this);

			sceneManager.loadingScene.hideLoadingScreen();
		});
	}

	buildUI() {
		super.buildUI();

		this.readyButton = this.advTexture.getControlByName('readyButton');

		this.uiComponents = new MenuUIComponentHooks(1);

		this.uiComponents.moveList = this.advTexture.getControlByName('listTextBlock');

		// Attach the hooks to the UI objects
		// Player Display
		this.uiComponents.setFetchButton(this.advTexture.getControlByName('fetch_1'));
		this.uiComponents.setInputBox(this.advTexture.getControlByName('giveNumber_1'));
		this.uiComponents.setPokemonImage(this.advTexture.getControlByName('pokemonImage_1'));
		this.uiComponents.setTypeSingleImage(this.advTexture.getControlByName('typeImageSingle_1'));
		this.uiComponents.setTypeDualImage_1(this.advTexture.getControlByName('typeImageDual1_1'));
		this.uiComponents.setTypeDualImage_2(this.advTexture.getControlByName('typeImageDual2_1'));
		this.uiComponents.setChoiceDisplay(this.advTexture.getControlByName('playerPokeDisplay'));

		this.movesToBeTaught = this.advTexture.getControlByName('knownMoveText');

		this.movesToBeTaught.text = 'Moves your Pokémon will learn: \n\n';

		//set the background color
		this.uiComponents.choiceDisplay.background = helper.getTypeColor(
			gameManager.Player1Pokemon.type[0]
		);

		//set the pokemon image and make it visible
		this.uiComponents.pokemonImage.alpha = 1;
		this.uiComponents.pokemonImage.source = gameManager.Player1Pokemon.sprite;

		//set the pokemon type image and make it visible
		if (gameManager.Player1Pokemon.type.length == 1) {
			this.uiComponents.typeSingleImage.alpha = 1;
			this.uiComponents.typeSingleImage.source = helper.getTypeImageURL(
				gameManager.Player1Pokemon.type[0]
			);
			this.uiComponents.typeDualImage_1.alpha = 0;
			this.uiComponents.typeDualImage_2.alpha = 0;
		} else {
			this.uiComponents.typeDualImage_1.alpha = 1;
			this.uiComponents.typeDualImage_1.source = helper.getTypeImageURL(
				gameManager.Player1Pokemon.type[0]
			);
			this.uiComponents.typeDualImage_2.alpha = 1;
			this.uiComponents.typeDualImage_2.source = helper.getTypeImageURL(
				gameManager.Player1Pokemon.type[1]
			);
			this.uiComponents.typeSingleImage.alpha = 0;
		}
		// SETUP Move LIST
		loadMoveListString().then((listString) => {
			this.uiComponents.moveList.text = helper.capLetter(listString);
		});

		this.uiComponents.moveList.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
		this.uiComponents.moveList.resizeToFit = true;

		// HIDE READY BUTTON AND MAKE IT UNCLICKABLE UNTIL NEEDED
		// AND SET UP WHAT IT WILL DO WHEN EVENTUALLY CLICKED
		this.readyButton.alpha = 0;
		this.readyButton.isHitTestVisible = false;

		this.setupInput(this.uiComponents, this.movesToBeTaught, this.readyButton);
	}

	setupInput(UIComponents, movesToBeTaught, readyButton) {
		super.setupInput();

		//clear input box on focus
		UIComponents.inputBox.onFocusObservable.add(function () {
			UIComponents.inputBox.text = '';
		});

		// Add Event Listeners
		// check if input is a number and that there IS an input
		UIComponents.fetchButton.onPointerUpObservable.add(function () {
			// temp variable to hold the input - aliasing to make easier
			var inputText = UIComponents.inputBox.text;

			//console.log(dataHandler.Player1Pokemon.learnableMoves);

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

			// check if the move is learnable, and then add it to the list
			else if (gameManager.Player1Pokemon.learnableMoves.get(parseInt(inputText))) {
				movesToBeTaught.text +=
					gameManager.Player1Pokemon.learnableMoves.get(parseInt(inputText))[2] + '\n';
				gameManager.userInput.pokemon1Moves.push(
					gameManager.Player1Pokemon.learnableMoves.get(parseInt(inputText))[1]
				);
			}

			// if it's not random and it's a number, then set the pokemon number
			else {
				console.log('not a valid move');
			}

			//clear the input box
			UIComponents.inputBox.text = '';

			// if you have learned 4 moves, then make the ready button visible and clickable
			if (gameManager.userInput.pokemon1Moves.length == 4) {
				console.log('you learned 4 moves');
				readyButton.alpha = 1;
				readyButton.isHitTestVisible = true;

				readyButton.onPointerClickObservable.add(function () {
					sceneManager.loadingScene.showLoadingScreen();
					gameManager.storeMoveAPICallData(this.scene);
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
	}
}

export async function setMoveSelectGUI() {}

export async function getGUI(scene) {
	// Load from GUI snippet
	// https://gui.babylonjs.com/
	// Load from GUI snippet
	let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('GUI', true, scene);
	advancedTexture.scaleToWidth = 1376;
	advancedTexture.scaleToHeight = 768;

	return await advancedTexture.parseFromSnippetAsync('WHRNZY#8');
}
