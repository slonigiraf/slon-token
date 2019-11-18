const BigNumber = web3.BigNumber;

const SlonigirafToken = artifacts.require("SlonigirafToken");

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract ('SlonigirafToken', accounts => {

    beforeEach(async function(){
        this.token = await SlonigirafToken.new();
    });

    describe('token attributes', function(){
        it('has the correct name', async function(){
            const name = await this.token.name();
            name.should.equal("Slonigiraf Token");
        });
        it('has the correct symbol', async function(){
            const symbol = await this.token.symbol();
            symbol.should.equal("SLON");
        });
        it('has the correct decimals', async function(){
            const decimals = await this.token.decimals();
            decimals.should.be.bignumber.equal(18);
        });
        it('has the correct total supply', async function(){
            const totalSupply = await this.token.totalSupply();
            totalSupply.should.be.bignumber.equal(10000000000000000);
        });
    })
})