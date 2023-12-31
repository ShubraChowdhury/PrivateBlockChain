/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message`
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *
 */

/************************** REFERENCE *********************************************************
				https://knowledge.udacity.com/questions/623167
				https://knowledge.udacity.com/questions/706001
				https://knowledge.udacity.com/questions/611514
				https://knowledge.udacity.com/questions/819292
				https://knowledge.udacity.com/questions/939082
				https://knowledge.udacity.com/questions/612432
***********************************************************************************************/


const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to
     * create the `block hash` and push the block into the chain array. Don't for get
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention
     * that this method is a private method.
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
		//	 New Block height is previous block height +1
			block.height = this.chain.length+1;
		//	 get time in human readable format
			block.time = new Date().getTime().toString().slice(0,-3);
		//	 Check for Genisis block, if it is genisis block then the previous block hash will be null
			if(this.chain.length>0)
			 {
				 block.previousBlockHash = self.chain[self.chain.length - 1].hash;

			  }
            else {

			//block.previousBlockHash = self.chain[block.height - 1].hash;  //hash of the previous block
			 block.previousBlockHash = null;
			     }

			// set hash for new block
			block.hash = SHA256(JSON.stringify(block)).toString();
		//	 push the new block  to blockchain
			self.chain.push(block);

		// Review 1 suggsted that I validate the chain to validate all the blocks in chain , if any defective blocks is present then
		//validateChain() will return those blocks
			//await this.chain.validateChain();
			 self.validateChain();

		//	 update the height of newly created blockchain
			self.height += 1;
			resolve(block);
			block.height = self.height;




        });


    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {

		//Electrum Address bc1qxtscf0vynv22j2uu79kspu2kzx5xpewx3826js  address did not work on postman
		//Electrum Address bc1qjd7lp88zurm5dvy8ymmnp9yv5ra2s6c8ukyr0z  address did not work on postman
		//Bitcoin address tb1qmcetaqq55mctxx8txtpwyf2dwc6wqel22hgv50   testnet address did not work on postman
		//Bitcoin address  tb1q5c4wdr6wuap7auspxdetrn4zyxk3elp86v5w09  testnet address did not work on postman
		//Bitcoin core legacy address msZRfqRx658LQHmcbq6cgA1TMBc2U8bikd  Legacy	testnet address created using getnewaddress "" legacy and this worked on postman

		/****** Reference from Project guidance *********************/
		// address:${new Date().getTime().toString().slice(0,-3)}:starRegistry;
		//resolve(`${address}:${this._getCurrentTimeStamp()}:starRegistry`)
        resolve(`${address}:${new Date().getTime().toString().slice(0, -3)}:starRegistry`)

        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address
     * @param {*} message
     * @param {*} signature
     * @param {*} star
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {

		/* * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])` */
        let messageTime = parseInt(message.split(':')[1])

        /* 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));` */
        let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));

		/* 3. Check if the time elapsed is less than 5 minutes */

		if (currentTime - messageTime <= 600) {

			/* 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`*/
		      const isValid = bitcoinMessage.verify(message, address, signature);

			if (isValid) {
				/* Create the block and add it to the chain */
				//let newBlock = new BlockClass.Block({address: address, message: message, signature: signature, star: star});
				let newBlock = new BlockClass.Block({star:star, owner:address});
				let resBlock = await self._addBlock(newBlock);
				/* 6. Resolve with the block added. */
				resolve(resBlock);
					}
			else {
				reject (new Error('Error Block Cannot be Added'));
					}

	 }

        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {

			let block = self.chain.find(p => p.hash == hash); // as per review 1 suggestion changed filter to find
			if(block) {
						   resolve(block);
					   }
		   else {
			   //console.log('Block By hash not Found')
			  resolve(Error('Block By hash not Found'));
		   }







        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object
     * with the height equal to the parameter `height`
     * @param {*} height
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address
     https://knowledge.udacity.com/questions/939082
     https://knowledge.udacity.com/questions/612432
     */
    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {

		self.chain.forEach(async(str_obj) => {
		let star_data = await str_obj.getBData();

		if(star_data && star_data.owner === address){
			    console.log(star_data.owner)
				stars.push(star_data);

		}
		});
		resolve(stars);




        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
	    let self = this;
	    let errorLog = [];
	    return new Promise(async (resolve, reject) => {
		/* 1. You should validate each block using `validateBlock`  */
	      self.chain.forEach(async (block) => {
	        try {
	          /* 2. Each Block should check the with the previousBlockHash
	          .validate() in block.js checks currHash to  newHash
	          */
	          await block.validate();
	        }
	        catch (e) {
	          errorLog.push(e);
	        }
	      });

	     // Resolving errorLog
	        resolve(errorLog);

	    });
	  }
}

module.exports.Blockchain = Blockchain;