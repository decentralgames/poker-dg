import assert from 'assert';
import ChipRange from './chip-range';
import { SeatIndex } from 'types/seat-index';
import { Chips } from 'types/chips';
import Round, { Action as RoundAction } from './round';
import { SeatArray } from 'types/seat-array';
import { Blinds } from 'types/blinds';
import { RoundOfBetting } from './community-cards';

export enum Action {
  LEAVE,
  MATCH,
  RAISE,
}

export class ActionRange {
  canRaise: boolean;
  chipRange: ChipRange;

  constructor(canRaise: boolean, chipRange: ChipRange = new ChipRange(0, 0)) {
    this.canRaise = canRaise;
    this.chipRange = chipRange;
  }
}

export default class BettingRound {
  private _players: SeatArray;
  private _round: Round;
  private _biggestBet: Chips;
  private _minRaise: Chips;
  private _blinds: Blinds;
  private _roundOfBetting: RoundOfBetting;

  constructor(
    players: SeatArray,
    nonFoldedPlayers: boolean[],
    firstToAct: SeatIndex,
    minRaise: Chips,
    blinds: Blinds,
    roundOfBetting: RoundOfBetting,
    biggestBet: Chips = 0
  ) {
    this._round = new Round(
      players.map((player) => !!player),
      nonFoldedPlayers,
      firstToAct
    );
    this._players = players;
    this._biggestBet = biggestBet;
    this._minRaise = minRaise;
    this._blinds = blinds;
    this._roundOfBetting = roundOfBetting;

    assert(
      firstToAct < players.length,
      'Seat index must be in the valid range'
    );
    assert(players[firstToAct], 'First player to act must exist');
  }

  inProgress(): boolean {
    return this._round.inProgress();
  }

  isContested(): boolean {
    return this._round.isContested();
  }

  playerToAct(): SeatIndex {
    return this._round.playerToAct();
  }

  biggestBet(): Chips {
    return this._biggestBet;
  }

  minRaise(): Chips {
    return this._minRaise;
  }

  players(): SeatArray {
    return this._round.activePlayers().map((isActive, index) => {
      return isActive ? this._players[index] : null;
    });
  }

  activePlayers(): boolean[] {
    return this._round.activePlayers();
  }

  nonFoldedPlayers(): boolean[] {
    return this._round.nonFoldedPlayers();
  }

  actionTakenInRound(): boolean[] {
    return this._round.actionTakenInRound();
  }

  numActivePlayers(): number {
    return this._round.numActivePlayers();
  }

  legalActions(): ActionRange {
    const player = this._players[this._round.playerToAct()];
    assert(player !== null);
    const playerChips = player.totalChips();
    
    const canRaise = playerChips >= this._biggestBet;
    if (canRaise) {
      const minBet = (this._roundOfBetting === RoundOfBetting.PREFLOP && this._biggestBet < this._minRaise) ? 
                      this._minRaise : 
                      this._biggestBet + this._minRaise;
                      
      const raiseRange = new ChipRange(
        Math.min(minBet, playerChips),
        playerChips
      );
      return new ActionRange(canRaise, raiseRange);
    } else {
      return new ActionRange(canRaise);
    }
  }

  actionTaken(action: Action, bet: Chips = 0) {
    const player = this._players[this._round.playerToAct()];
    assert(player !== null);
    if (action === Action.RAISE) {
      assert(this.isRaiseValid(bet));
      player.bet(bet);
      // update min raise only if player does not shove before matching current raise
      const playerRaise = bet - this._biggestBet;
      this._minRaise = (playerRaise >= this._minRaise) ? playerRaise : this._minRaise;
      this._biggestBet = bet;
      let actionFlag = RoundAction.AGGRESSIVE;
      if (player.stack() === 0) {
        actionFlag |= RoundAction.LEAVE;
      }
      this._round.actionTaken(actionFlag);
    } else if (action === Action.MATCH) {
      player.bet(Math.min(this._biggestBet, player.totalChips()));
      let actionFlag = RoundAction.PASSIVE;
      if (player.stack() === 0) {
        actionFlag |= RoundAction.LEAVE;
      }
      this._round.actionTaken(actionFlag);
    } else {
      assert(action === Action.LEAVE);
      this._round.actionTaken(RoundAction.LEAVE, true);
    }
  }

  standUp(seat: number): void {
    this._players[seat] = null;
    this._round.standUp(seat);
  }

  isRaiseValid(bet: Chips): boolean {
    const player = this._players[this._round.playerToAct()];
    assert(player !== null);

    //In heads up preflop round, we need to check if the BB goes all-in
    const bigBlindIsAllIn = ( this._players[this._blinds.big]?.stack() ?? 0 ) === 0; 
    const playerChips = player.stack() + player.betSize();
    //If BB is all-in, adjust the min-bet so that the SB is able to either call or check their all-in
    const minBet = (this._roundOfBetting === RoundOfBetting.PREFLOP && this.numActivePlayers() === 2 && bigBlindIsAllIn) ?  
                    this._players[this._blinds.big]?.betSize() ?? 0 : 
                    (this._roundOfBetting === RoundOfBetting.PREFLOP && bigBlindIsAllIn && this._biggestBet < this._minRaise) ? 
                    this._minRaise : 
                    this._biggestBet + this._minRaise;

    if (playerChips > this._biggestBet && playerChips < minBet) {
      return bet === playerChips;
    }
    return bet >= minBet && bet <= playerChips;
  }
}
