//TODO: overflow and underflow issues should be tested in all functions
const BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');
require('truffle-test-utils').init();
const SlonigirafToken = artifacts.require("SlonigirafToken");
const expectedInitialTokenSupply = new BigNumber(1e31);
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
        const notSet = undefined;

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

            ((await this.token.balanceOf(accountA)).toString()).should.be.bignumber.equal(expectedInitialTokenSupply);
            assert.equal(await this.token.balanceOf(accountB), 0);
            assert.equal(await this.token.balanceOf(accountC), 0);
            assert.equal(await this.token.balanceOf(accountD), 0);
        });
    });


    describe('approve', function () {
        const amount = 100;
        const amountMinusOne = amount-1;
        const amountPlusOne = amount+1;
        const anotherAmount = 1000;

        it('approves the requested amount', async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            const allowance = await this.token.allowance(accountA, accountB);
            assert.equal(allowance, amount);
        });

        it("should emit right event at approve function", async function () {
            let result = await this.token.approve(accountB, amount, { from: accountA });
            truffleAssert.eventEmitted(result, 'Approval', (ev) => {
                ev.value.toString().should.be.bignumber.equal(amount);
                return ev.owner === accountA && ev.spender === accountB;
            });
        });

        it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            await this.token.approve(accountB, anotherAmount, { from: accountA });
            const allowance = await this.token.allowance(accountA, accountB);
            assert.equal(allowance, anotherAmount);
        });
        it('approved amount can be transfered', async function () {
            const fromAccountBalanceBeforeApprovalAndTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceBeforeApprovalAndTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const approvedAccountBalanceBeforeApprovalAndTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceBeforeApprovalAndTransfer.should.be.bignumber.equal(0);

            await this.token.approve(accountB, amount, { from: accountA });

            const fromAccountBalanceAfterApprovalBeforeTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceAfterApprovalBeforeTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const approvedAccountBalanceAfterApprovalBeforeTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceAfterApprovalBeforeTransfer.should.be.bignumber.equal(0);

            await this.token.transferFrom(accountA, accountC, amountMinusOne, {from: accountB});
            const expectedAmountInAccountAAfterTransfer = expectedInitialTokenSupply.minus(amountMinusOne);

            const fromAccountBalanceAfterTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceAfterTransfer.should.be.bignumber.equal(expectedAmountInAccountAAfterTransfer);

            const approvedAccountBalanceAfterApprovalAndTransfer = (await this.token.balanceOf.call(accountB)).toString();
            approvedAccountBalanceAfterApprovalAndTransfer.should.be.bignumber.equal(0);

            const toAccountBalanceAfterTransfer = (await this.token.balanceOf.call(accountC)).toString();
            toAccountBalanceAfterTransfer.should.be.bignumber.equal(amountMinusOne);

            const allowanceUpdated = await this.token.allowance(accountA, accountB);
            assert.equal(allowanceUpdated, 1);
        });

        it('reverts when approved account tries to send an amount exceeding the approved amount', async function () {
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

            const allowanceUpdated = await this.token.allowance(accountA, accountB);
            assert.equal(allowanceUpdated, amount);
        });
    });

    
    describe('increaseAllowance', function () {
        const amount = 100;
        const amountPlusOne = amount+1;

        it('approves the requested amount', async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            const allowance = await this.token.allowance(accountA, accountB);
            assert.equal(allowance, amount);

            await this.token.increaseAllowance(accountB, 1, { from: accountA });
            const allowanceIncreased = await this.token.allowance(accountA, accountB);
            assert.equal(allowanceIncreased, amountPlusOne);
        });

        it("should emit right event at increaseAllowance function", async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            let result = await this.token.increaseAllowance(accountB, 1, { from: accountA });
            truffleAssert.eventEmitted(result, 'Approval', (ev) => {
                ev.value.toString().should.be.bignumber.equal(amountPlusOne);
                return ev.owner === accountA && ev.spender === accountB;
            });
        });
    });
    
    describe('decreaseAllowance', function () {
        const amount = 100;
        const amountMinusOne = amount-1;
        const amountPlusOne = amount+1;

        it('decreased the approved amount', async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            await this.token.decreaseAllowance(accountB, 1, { from: accountA });
            const allowanceDecreased = await this.token.allowance(accountA, accountB);
            assert.equal(allowanceDecreased, amountMinusOne);
        });

        it("should emit right event at decreaseAllowance function", async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            let result = await this.token.decreaseAllowance(accountB, 1, { from: accountA });
            truffleAssert.eventEmitted(result, 'Approval', (ev) => {
                ev.value.toString().should.be.bignumber.equal(amountMinusOne);
                return ev.owner === accountA && ev.spender === accountB;
            });
        });

        it('returns an error when decrease is going below zero lefts allowance intact', async function () {
            await this.token.approve(accountB, amount, { from: accountA });
            await truffleAssert.reverts(
                this.token.decreaseAllowance(accountB, amountPlusOne, { from: accountA }), "Returned error: VM Exception while processing transaction: revert ERC20: decreased allowance below zero -- Reason given: ERC20: decreased allowance below zero."
            );
            const allowance = await this.token.allowance(accountA, accountB);
            assert.equal(allowance, amount);
        });
    });

    describe('balanceOf', function () {
        it("should return the balance of token for specified account", async function () {
            const deployerBalance = (await this.token.balanceOf.call(accountA)).toString();
            deployerBalance.should.be.bignumber.equal(expectedInitialTokenSupply);
        });
    });

    describe('burn', function () {
        const expectedInitialAccountBalance = new BigNumber(100);
        const burnAmount = new BigNumber(10);
        const expectedAccountBalanceAfterBurn = expectedInitialAccountBalance.minus(burnAmount);

        it('burns tokens from specified account and reduces the total supply', async function () {
            this.token.transfer(accountB, expectedInitialAccountBalance);
            const observedInitialAccountBalance = (await this.token.balanceOf.call(accountB)).toString();
            observedInitialAccountBalance.should.be.bignumber.equal(expectedInitialAccountBalance);

            const totalSupplyBeforeBurn = new BigNumber(await this.token.totalSupply());
            totalSupplyBeforeBurn.should.be.bignumber.equal(expectedInitialTokenSupply);

            await this.token.burn(burnAmount, { from: accountB });

            const totalSupplyAfterBurn = new BigNumber(await this.token.totalSupply());
            const expectedTotalSupplyAfterBurn = expectedInitialTokenSupply.minus(burnAmount);
            totalSupplyAfterBurn.should.be.bignumber.equal(expectedTotalSupplyAfterBurn);

            const observedAccountBalanceAfterBurn = (await this.token.balanceOf.call(accountB)).toString();
            observedAccountBalanceAfterBurn.should.be.bignumber.equal(expectedAccountBalanceAfterBurn);

        });
    });


    describe('burnFrom', function () {
        const amount = 100;
        const amountMinusOne = amount-1;
        const amountPlusOne = amount+1;

        it('approves the requested amount, burns and updates total supply', async function () {
            const balanceABeforeApprovalAndBurn = (await this.token.balanceOf.call(accountA)).toString();
            balanceABeforeApprovalAndBurn.should.be.bignumber.equal(expectedInitialTokenSupply);

            await this.token.approve(accountB, amount, { from: accountA });

            this.token.burnFrom(accountA, amountMinusOne, {from: accountB});
            const expectedBalanceAAfterBurn = expectedInitialTokenSupply.minus(amountMinusOne);
            const balanceAAfterBurn = (await this.token.balanceOf.call(accountA)).toString();
            balanceAAfterBurn.should.be.bignumber.equal(expectedBalanceAAfterBurn);

            assert.equal(await this.token.allowance(accountA, accountB), 1);

            const balanceBAfterApprovalAndBurn = (await this.token.balanceOf.call(accountB)).toString();
            balanceBAfterApprovalAndBurn.should.be.bignumber.equal(0);

            const totalSupplyAfterBurn = new BigNumber(await this.token.totalSupply());
            const expectedTotalSupplyAfterBurn = expectedInitialTokenSupply.minus(amountMinusOne);
            totalSupplyAfterBurn.should.be.bignumber.equal(expectedTotalSupplyAfterBurn);

            const allowanceAfterBurn = await this.token.allowance(accountA, accountB);
            assert.equal(allowanceAfterBurn, 1);
        });

        it('approves the requested amount, reverts when approved account tries to burn an amount exceeding the approved amount', async function () {
            await this.token.approve(accountB, amount, { from: accountA });

            await truffleAssert.reverts(
                this.token.burnFrom(accountA, amountPlusOne, {from: accountB}), "Returned error: VM Exception while processing transaction: revert ERC20: burn amount exceeds allowance -- Reason given: ERC20: burn amount exceeds allowance."
            );
            
            const balanceAAfterBurn = (await this.token.balanceOf.call(accountA)).toString();
            balanceAAfterBurn.should.be.bignumber.equal(expectedInitialTokenSupply);

            const balanceBAfterApprovalAndBurn = (await this.token.balanceOf.call(accountB)).toString();
            balanceBAfterApprovalAndBurn.should.be.bignumber.equal(0);

            const totalSupplyAfterBurn = new BigNumber(await this.token.totalSupply());
            totalSupplyAfterBurn.should.be.bignumber.equal(expectedInitialTokenSupply);

            assert.equal(await this.token.allowance(accountA, accountB), amount);
        });
    });

    

    describe('transfer', function () {
        it("should transfer specified number of tokens to specified account", async function () {
            const transferAmount = new BigNumber(10e18);

            const fromAccountBalanceBeforeTransfer = (await this.token.balanceOf.call(accountA)).toString();
            fromAccountBalanceBeforeTransfer.should.be.bignumber.equal(expectedInitialTokenSupply);

            const toAccountBalanceBeforeTransfer = (await this.token.balanceOf.call(accountB)).toString();
            toAccountBalanceBeforeTransfer.should.be.bignumber.equal(0);

            await this.token.transfer(accountB, transferAmount);
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

            await this.token.transfer(accountB, transferAmountSufficient, { from: accountA });

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
    })
})