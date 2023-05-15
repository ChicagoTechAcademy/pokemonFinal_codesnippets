storeMoveAPICallData(scene) {
        var assetsManager = new BABYLON.AssetsManager(scene);

        // load the moves for the player
        dataLoader.loadMoveData(this.userInput.pokemon1Moves[0], assetsManager, 1)
        dataLoader.loadMoveData(this.userInput.pokemon1Moves[1], assetsManager, 1)
        dataLoader.loadMoveData(this.userInput.pokemon1Moves[2], assetsManager, 1)
        dataLoader.loadMoveData(this.userInput.pokemon1Moves[3], assetsManager, 1)


        var num = this.Player2Pokemon.getLearnableMoves().length;

        // pick random move for the computer
        var temp = Math.floor(Math.random() * num)
        this.userInput.pokemon2Moves[0] = this.Player2Pokemon.getLearnableMoves()[temp];

        temp = Math.floor(Math.random() * num)
        this.userInput.pokemon2Moves[1] = this.Player2Pokemon.getLearnableMoves()[temp];

        temp = Math.floor(Math.random() * num)
        this.userInput.pokemon2Moves[2] = this.Player2Pokemon.getLearnableMoves()[temp];

        temp = Math.floor(Math.random() * num)
        this.userInput.pokemon2Moves[3] = this.Player2Pokemon.getLearnableMoves()[temp];

        // load the moves for the computer
        dataLoader.loadMoveData(this.userInput.pokemon2Moves[0], assetsManager, 2)
        dataLoader.loadMoveData(this.userInput.pokemon2Moves[1], assetsManager, 2)
        dataLoader.loadMoveData(this.userInput.pokemon2Moves[2], assetsManager, 2)
        dataLoader.loadMoveData(this.userInput.pokemon2Moves[3], assetsManager, 2)

        assetsManager.load();
    
        assetsManager.onFinish = function () {

            sceneManager.switchScene();
        };
        
    }
