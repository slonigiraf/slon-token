const BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');
require('truffle-test-utils').init();
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


    describe('allowance', function () {
        const amount = 100;

        it('approves the requested amount', async function () {
            assert.equal(await this.token.allowance(accountA, accountB), 0);
            assert.equal(await this.token.allowance(accountA, accountC), 0);
            assert.equal(await this.token.allowance(accountA, accountD), 0);

            assert.equal(await this.token.allowance(accountB, accountA), 0);
            assert.equal(await this.token.allowance(accountB, accountC), 0);
            assert.equal(await this.token.allowance(accountB, accountD), 0);

            await this.token.approve(accountB, amount, { from: accountA });

            assert.equal(await this.token.allowance(accountA, accountB), amount);
            assert.equal(await this.token.allowance(accountA, accountC), 0);
            assert.equal(await this.token.allowance(accountA, accountD), 0);

            assert.equal(await this.token.allowance(accountB, accountA), 0);
            assert.equal(await this.token.allowance(accountB, accountC), 0);
            assert.equal(await this.token.allowance(accountB, accountD), 0);
        });
    });


    describe('approve', function () {
        const amount = 100;
        const amountPlusOne = amount+1;
        const anotherAmount = 1000;

        it('approves the requested amount', async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            const allowance = await this.token.allowance(accountA, accountB);
            assert.equal(allowance, amount);
        });

        it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            await this.token.approve(accountB, anotherAmount, { from: accountA });
            const allowance = await this.token.allowance(accountA, accountB);
            assert.equal(allowance, anotherAmount);
        });
        it('approves the requested amount and requested amount can be transfered', async function () {
            const fromAccountBalanceBeforeApprovalAndTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceBeforeApprovalAndTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const approvedAccountBalanceBeforeApprovalAndTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceBeforeApprovalAndTransfer.should.be.bignumber.equal(0);

            await this.token.approve(accountB, amount, { from: accountA });

            const fromAccountBalanceAfterApprovalBeforeTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceAfterApprovalBeforeTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const approvedAccountBalanceAfterApprovalBeforeTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceAfterApprovalBeforeTransfer.should.be.bignumber.equal(0);


            this.token.transferFrom(accountA, accountC, amount, {from: accountB});
            const expectedAmountInAccountAAfterTransfer = expectedInitialTokenSupply.minus(amount);

            const fromAccountBalanceAfterTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceAfterTransfer.should.be.bignumber.equal(expectedAmountInAccountAAfterTransfer);

            const approvedAccountBalanceAfterApprovalAndTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceAfterApprovalAndTransfer.should.be.bignumber.equal(0);

            const toAccountBalanceAfterTransfer = (await this.token.balanceOf.call(accountC)).toString();
            toAccountBalanceAfterTransfer.should.be.bignumber.equal(amount);

        });

        it('approves the requested amount, reverts when approved account tries to send an amount exceeding the approved amount', async function () {
            const fromAccountBalanceBeforeApprovalAndTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceBeforeApprovalAndTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const approvedAccountBalanceBeforeApprovalAndTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceBeforeApprovalAndTransfer.should.be.bignumber.equal(0);

            await this.token.approve(accountB, amount, { from: accountA });

            const fromAccountBalanceAfterApprovalBeforeTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceAfterApprovalBeforeTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const approvedAccountBalanceAfterApprovalBeforeTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceAfterApprovalBeforeTransfer.should.be.bignumber.equal(0);


            await truffleAssert.reverts(
                this.token.transferFrom(accountA, accountC, amountPlusOne, {from: accountB}), "Returned error: VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance -- Reason given: ERC20: transfer amount exceeds allowance."
            );

            const expectedAmountInAccountAAfterTransfer = expectedInitialTokenSupply;

            const fromAccountBalanceAfterTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceAfterTransfer.should.be.bignumber.equal(expectedAmountInAccountAAfterTransfer);

            const approvedAccountBalanceAfterApprovalAndTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceAfterApprovalAndTransfer.should.be.bignumber.equal(0);

            const toAccountBalanceAfterTransfer = (await this.token.balanceOf.call(accountC)).toString();
            toAccountBalanceAfterTransfer.should.be.bignumber.equal(0);

        });
    });

    describe('balanceOf', function () {
        it("should return the balance of token for specified account", async function () {
            const deployerBalance = (await this.token.balanceOf.call(accountA)).toString();
            deployerBalance.should.be.bignumber.equal(expectedInitialTokenSupply);
        });
    });

    describe('transfer', function () {
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

        it("should emit right event at transfer function", async function () {
            const transferAmount = new BigNumber(10e18);

            const fromAccountBalanceBeforeTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceBeforeTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const toAccountBalanceBeforeTransfer = (await this.token.balanceOf.call(accountB)).toString();
            toAccountBalanceBeforeTransfer.should.be.bignumber.equal(0);

            let result = await this.token.transfer(accountB, transferAmount);

            truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
                ev.value.toString().should.be.bignumber.equal(transferAmount);
                return ev.from === accountA && ev.to === accountB;
            });
        });

        it('reverts when funds are insufficient', async function () {
            const transferAmountSufficient = new BigNumber(10e18);
            const transferAmountInSufficient = transferAmountSufficient.plus(1);

            const accountBInitial = (await this.token.balanceOf.call(accountB)).toString();
            accountBInitial.should.be.bignumber.equal(new BigNumber(0));

            this.token.transfer(accountB, transferAmountSufficient, { from: accountA });

            const accountBAfterTransferFromA = (await this.token.balanceOf.call(accountB)).toString();
            accountBAfterTransferFromA.should.be.bignumber.equal(transferAmountSufficient);

            await truffleAssert.reverts(
                this.token.transfer(accountC, transferAmountInSufficient, { from: accountB }), "Returned error: VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance -- Reason given: ERC20: transfer amount exceeds balance."
            );

            const accountBAfterTransferToC = (await this.token.balanceOf.call(accountB)).toString();
            accountBAfterTransferToC.should.be.bignumber.equal(transferAmountSufficient);

            const accountCAfterTransferFromB = (await this.token.balanceOf.call(accountC)).toString();
            accountCAfterTransferFromB.should.be.bignumber.equal(new BigNumber(0));
        });

        it('reverts when 0 address is sent instead of recipient address', async function () {
            const transferAmount = new BigNumber(10e18);

            const accountAInitial = (await this.token.balanceOf.call(accountA)).toString();
            accountAInitial.should.be.bignumber.equal(expectedInitialTokenSupply);

            await truffleAssert.reverts(
                this.token.transfer("0x0000000000000000000000000000000000000000", transferAmount, { from: accountA }), "Returned error: VM Exception while processing transaction: revert ERC20: transfer to the zero address -- Reason given: ERC20: transfer to the zero address."
            );

            const accountAFinal = (await this.token.balanceOf.call(accountA)).toString();
            accountAFinal.should.be.bignumber.equal(expectedInitialTokenSupply);
        });

        it('reverts when invalid address is sent instead of recipient address', async function () {
            const transferAmount = new BigNumber(10e18);

            const accountAInitial = (await this.token.balanceOf.call(accountA)).toString();
            accountAInitial.should.be.bignumber.equal(expectedInitialTokenSupply);

            await truffleAssert.fails(
                this.token.transfer("0x", transferAmount, { from: accountA }), "invalid address (arg=\"recipient\", coderType=\"address\", value=\"0x\")"
            );

            const accountAFinal = (await this.token.balanceOf.call(accountA)).toString();
            accountAFinal.should.be.bignumber.equal(expectedInitialTokenSupply);
        });

        /*

functions for transfer from the same as transfer should be added

functions for approval
and sometimes function for burning extra tokens

overflow or underflow total supply or other uint values. 



The transferFrom function is very similar to transfer, but here you also 
need to test that the spender has enough approved balance for sending.

Here are the tests when the spender has insufficient funds required for a transfer.

Checking Approvals
The approve function is the simplest function from the ERC20 standard. 
There is no need to check for zero address. It’s enough to check that the allowance array 
is correctly filled. Also if you don’t have increaseApproval or decreaseApproval 
functions, approve will overwrite all previous values.

So it is recommend to use these functions as protection from unnecessary overwrites. 
And of course, it’s important to check that you get correct logs from the Approval event.

Burning Unsold Tokens
Most smart contracts include a function for burning tokens left after the main sale. 
Lots of them have a special token holder account, sometimes it’s the owner account. 
So the best solution for burning unsold tokens is the following:

get amount of tokens on holder’s address
then subtract this amount from total supply
and set amount of tokens on holder’s address to zero.
This will ensure that you don’t burn all the tokens, so it’s important to lay out your token burn strategy in your white paper.
        */


    })
})