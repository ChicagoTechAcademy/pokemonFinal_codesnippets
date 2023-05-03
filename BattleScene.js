import { BattleUIComponentHooks } from '../GUIHelpers/battleUIComponentHooks.js';
import * as camera from '../engine/camera.js';
import * as battle from '../modules/battle.js';
import * as helper from '../modules/helperFunctions.js';
import { Scene } from '../scenes/Scene.js';
import sceneManager from '../scenes/sceneManager.js';

import gameManager from '../dataHandlers/gameManager.js';

export class BattleScene extends Scene {
	constructor() {
		super();
		this.scene = new BABYLON.Scene(gameManager.engine);

		this.resetButton = null;
		this.playerUI = null;
		this.oppUI = null;

		this.advTexture = null;
		this.battleLogHook = null;

		gameManager.engine.displayLoadingUI = function () {};
		gameManager.engine.hideLoadingUI = function () {};

		camera.createCamera(this.scene, gameManager.canvas);

	}
	onActivate() {
		super.onActivate();
		//this.onInit();
	}

	onInit() {
		super.onInit();

		console.log(gameManager.Player1Pokemon);
		console.log(gameManager.Player2Pokemon);

		getGUI(this.scene).then((loadedAdvancedTexture) => {
			this.advTexture = loadedAdvancedTexture;

			helper.setBattleLogHook(this.advTexture.getControlByName('BattleLogText'));

			this.playerUI = new BattleUIComponentHooks(1);
			this.oppUI = new BattleUIComponentHooks(2);

			gameManager.setPlayerBattleUIHooks(this.playerUI);
			gameManager.setOpponentBattleUIHooks(this.oppUI);

			this.buildUI();

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

		console.log('Building Battle UI');

		//this.resetButton = this.advTexture.getControlByName('ResetButtonText');

		console.log(gameManager);

		this.playerUI.setNameHook(this.advTexture.getControlByName('Player1Name'));
		this.playerUI.setBackgroundHook(this.advTexture.getControlByName('Player1'));
		this.playerUI.setPokemonImage(this.advTexture.getControlByName('Player1Image'));
		this.playerUI.setHealthBar(this.advTexture.getControlByName('Player1Healthbar'));
		this.playerUI.setTypeSingleImage(this.advTexture.getControlByName('typeImageSingle_1'));
		this.playerUI.setTypeDualImage_1(this.advTexture.getControlByName('typeImageDual1_1'));
		this.playerUI.setTypeDualImage_2(this.advTexture.getControlByName('typeImageDual2_1'));
		this.playerUI.setStatHook(this.advTexture.getControlByName('Player1StatsText'));
		this.playerUI.setMove1ButtonHook(this.advTexture.getControlByName('Player1Move1Button'));
		this.playerUI.setMove2ButtonHook(this.advTexture.getControlByName('Player1Move2Button'));
		this.playerUI.setMove3ButtonHook(this.advTexture.getControlByName('Player1Move3Button'));
		this.playerUI.setMove4ButtonHook(this.advTexture.getControlByName('Player1Move4Button'));
		this.playerUI.setMove1TextHook(this.advTexture.getControlByName('Player1Move1Text'));
		this.playerUI.setMove2TextHook(this.advTexture.getControlByName('Player1Move2Text'));
		this.playerUI.setMove3TextHook(this.advTexture.getControlByName('Player1Move3Text'));
		this.playerUI.setMove4TextHook(this.advTexture.getControlByName('Player1Move4Text'));

		this.oppUI.setNameHook(this.advTexture.getControlByName('Player2Name'));
		this.oppUI.setBackgroundHook(this.advTexture.getControlByName('Player2'));
		this.oppUI.setPokemonImage(this.advTexture.getControlByName('Player2Image'));
		this.oppUI.setHealthBar(this.advTexture.getControlByName('Player2Healthbar'));
		this.oppUI.setTypeSingleImage(this.advTexture.getControlByName('typeImageSingle_2'));
		this.oppUI.setTypeDualImage_1(this.advTexture.getControlByName('typeImageDual1_2'));
		this.oppUI.setTypeDualImage_2(this.advTexture.getControlByName('typeImageDual2_2'));
		this.oppUI.setStatHook(this.advTexture.getControlByName('Player2StatsText'));
		this.oppUI.setMove1ButtonHook(this.advTexture.getControlByName('Player2Move1Button'));
		this.oppUI.setMove2ButtonHook(this.advTexture.getControlByName('Player2Move2Button'));
		this.oppUI.setMove3ButtonHook(this.advTexture.getControlByName('Player2Move3Button'));
		this.oppUI.setMove4ButtonHook(this.advTexture.getControlByName('Player2Move4Button'));
		this.oppUI.setMove1TextHook(this.advTexture.getControlByName('Player2Move1Text'));
		this.oppUI.setMove2TextHook(this.advTexture.getControlByName('Player2Move2Text'));
		this.oppUI.setMove3TextHook(this.advTexture.getControlByName('Player2Move3Text'));
		this.oppUI.setMove4TextHook(this.advTexture.getControlByName('Player2Move4Text'));

		let playerPoke = gameManager.Player1Pokemon;
		let oppPoke = gameManager.Player2Pokemon;

		//get the color of the pokemon's type 1 for the background
		var color = helper.getTypeColor(playerPoke.getType1());
		this.playerUI.backgroundHook.background = color;

		color = helper.getTypeColor(oppPoke.getType1());
		this.oppUI.backgroundHook.background = color;

		this.playerUI.nameHook.text = helper.capLetter(playerPoke.getName());
		this.oppUI.nameHook.text = helper.capLetter(oppPoke.getName());

		this.playerUI.pokemonImage.source = playerPoke.getSprite();
		this.oppUI.pokemonImage.source = oppPoke.getSprite();

		this.setTypeImages(this.playerUI, playerPoke);
		this.setTypeImages(this.oppUI, oppPoke);

		this.playerUI.statHook.text = this.getStatString(playerPoke);
		this.oppUI.statHook.text = this.getStatString(oppPoke);

		this.setupMoves(this.playerUI, playerPoke);
		this.setupMoves(this.oppUI, oppPoke);

		this.setupInput(this.playerUI, playerPoke);

		this.setupGame();
	}

	getStatString(thePokemon) {
		var temp = '';
		temp += 'HP: ' + thePokemon.getCurrHealth() + '/' + thePokemon.getMaxHP() + '\n';
		temp += 'Attack: ' + thePokemon.getAttack() + '\n';
		temp += 'Defense: ' + thePokemon.getDefense() + '\n';
		temp += 'Sp. Attack: ' + thePokemon.getSpecialAttack() + '\n';
		temp += 'Sp. Defense: ' + thePokemon.getSpecialDefense() + '\n';
		temp += 'Speed: ' + thePokemon.getSpeed();

		return temp;
	}

	setTypeImages(UIComponents, thePokemon) {

		if (thePokemon.getType2() == '') {
			var url =
				'https://duiker101.github.io/pokemon-type-svg-icons/icons/' +
				thePokemon.getType1() +
				'.svg';

			UIComponents.typeSingleImage.source = url;

			UIComponents.typeDualImage_1.alpha = 0;
			UIComponents.typeDualImage_2.alpha = 0;
		} else if (thePokemon.getType2() != '') {
			var url =
				'https://duiker101.github.io/pokemon-type-svg-icons/icons/' +
				thePokemon.getType1() +
				'.svg';

			UIComponents.typeDualImage_1.source = url;

			url =
				'https://duiker101.github.io/pokemon-type-svg-icons/icons/' +
				thePokemon.getType2() +
				'.svg';

			UIComponents.typeDualImage_2.source = url;

			UIComponents.typeSingleImage.alpha = 0;
		}
	}

	setupMoves(UIComponents, thePokemon) {
		UIComponents.move1TextHook.text = helper.capLetter(thePokemon.getMove1().getName());
		UIComponents.move2TextHook.text = helper.capLetter(thePokemon.getMove2().getName());
		UIComponents.move3TextHook.text = helper.capLetter(thePokemon.getMove3().getName());
		UIComponents.move4TextHook.text = helper.capLetter(thePokemon.getMove4().getName());
		UIComponents.move1ButtonHook.background = helper.getTypeColor(
			thePokemon.getMove1().getMoveType()
		);
		UIComponents.move2ButtonHook.background = helper.getTypeColor(
			thePokemon.getMove2().getMoveType()
		);
		UIComponents.move3ButtonHook.background = helper.getTypeColor(
			thePokemon.getMove3().getMoveType()
		);
		UIComponents.move4ButtonHook.background = helper.getTypeColor(
			thePokemon.getMove4().getMoveType()
		);
	}

	setupInput(UIComponents, thePokemon) {
		super.setupInput();

		UIComponents.move1ButtonHook.onPointerUpObservable.add(function () {
			console.log('Move 1');
			console.log(thePokemon.getMove1().getName());
			battle.attackRound(0);
		});
		UIComponents.move2ButtonHook.onPointerUpObservable.add(function () {
			console.log('Move 2');
			console.log(thePokemon.getMove2().getName());
			battle.attackRound(1);
		});
		UIComponents.move3ButtonHook.onPointerUpObservable.add(function () {
			console.log('Move 3');
			console.log(thePokemon.getMove3().getName());
			battle.attackRound(2);
		});
		UIComponents.move4ButtonHook.onPointerUpObservable.add(function () {
			console.log('Move 4');
			console.log(thePokemon.getMove4().getName());
			battle.attackRound(3);
		});
	}

	setupGame() {
		// 	loadPokemonUI(advancedTexture);

		var pokemonName1 = helper.capLetter(gameManager.Player1Pokemon.getName()); //done to reduce number of calls to capLetter and get name
		var pokemonName2 = helper.capLetter(gameManager.Player2Pokemon.getName());

		helper.addToBattleLog('Welcome to the world of Pokemon!');
		helper.addToBattleLog("It's a battle between " + pokemonName1 + ' and ' + pokemonName2 + '!');

		var pokemon1Speed = gameManager.Player1Pokemon.getSpeed();
		var pokemon2Speed = gameManager.Player2Pokemon.getSpeed();

		helper.addToBattleLog(
			pokemonName1 +
				"'s Speed: " +
				pokemon1Speed +
				', ' +
				pokemonName2 +
				"'s Speed: " +
				pokemon2Speed
		);

		var faster = helper.whoGoesFirst(gameManager.Player1Pokemon, gameManager.Player2Pokemon);

		if (faster == 1) {
			helper.addToBattleLog(pokemonName1 + ' goes first!');
		} else if (helper.whoGoesFirst(gameManager.Player1Pokemon, gameManager.Player2Pokemon) == 2) {
			helper.addToBattleLog(pokemonName2 + ' goes first!');
		}
	}

	onUpdate() {
		super.onUpdate();
	}

	dispose() {
		super.dispose();
	}
}

export async function getGUI(scene) {
	let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('GUI', true, scene);
	advancedTexture.scaleToWidth = 1376;
	advancedTexture.scaleToHeight = 768;

	return await advancedTexture.parseFromSnippetAsync('GVKEWI#6');
}
