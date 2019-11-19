const BigNumber = require('bignumber.js');
const SlonigirafToken = artifacts.require("SlonigirafToken");
const expectedInitialTokenSupply = new BigNumber(1e34);
const expectedNumberOfDecimals = 18;

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('SlonigirafToken', accounts => {

    let accountA, accountB, accountC, accountD;

    [accountA, accountB, accountC, accountD] = accounts;

    beforeEach(async function () {
        this.token = await SlonigirafToken.new();
    });

    describe('token attributes', function () {
        it('has the correct name', async function () {
            const name = await this.token.name();
            name.should.equal("Slonigiraf Token");
        });
        it('has the correct symbol', async function () {
            const symbol = await this.token.symbol();
            symbol.should.equal("SLON");
        });
        it('has the correct decimals', async function () {
            const decimals = new BigNumber(await this.token.decimals());
            decimals.should.be.bignumber.equal(expectedNumberOfDecimals);
        });
        it('has the correct total supply', async function () {
            const totalSupply = new BigNumber(await this.token.totalSupply());
            totalSupply.should.be.bignumber.equal(expectedInitialTokenSupply);
        });
    })

    describe('token functions', function () {
        it("should return the balance of token for specified account", async function () {
            const deployerBalance = (await this.token.balanceOf.call(accountA)).toString();
            deployerBalance.should.be.bignumber.equal(expectedInitialTokenSupply);
        });
        it("should transfer specified number of tokens to specified account", async function () {
            const transferAmount = new BigNumber(10e18);

            const fromAccountBalanceBeforeTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceBeforeTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const toAccountBalanceBeforeTransfer = (await this.token.balanceOf.call(accountB)).toString();
            toAccountBalanceBeforeTransfer.should.be.bignumber.equal(0);

            this.token.transfer(accountB, transferAmount);
            const expectedAmountInAccountAAfterTransfer = expectedInitialTokenSupply.minus(transferAmount);
        
            const fromAccountBalanceAfterTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceAfterTransfer.should.be.bignumber.equal(expectedAmountInAccountAAfterTransfer);

            const toAccountBalanceAfterTransfer = (await this.token.balanceOf.call(accountB)).toString();
            toAccountBalanceAfterTransfer.should.be.bignumber.equal(transferAmount);

        });



    })
})