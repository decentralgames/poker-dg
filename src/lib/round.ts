import assert from 'assert';
import { SeatIndex } from 'types/seat-index';

export enum Action {
  LEAVE = 1 << 0,
  PASSIVE = 1 << 1,
  AGGRESSIVE = 1 << 2,
}

export default class Round {
  private readonly _activePlayers: boolean[];
  private readonly _nonFoldedPlayers: boolean[];
  private _playerToAct: SeatIndex;
  private _lastAggressiveActor: SeatIndex;
  private _contested: boolean = false;
  private _firstAction: boolean = true;
  private _numActivePlayers: number = 0;
  private _actionTakenInRound: boolean[]; // If player acted in the current round
  
  constructor(
    activePlayers: boolean[],
    nonFoldedPlayers: boolean[],
    firstToAct: SeatIndex
  ) {
    this._activePlayers = activePlayers;
    this._nonFoldedPlayers = nonFoldedPlayers;
    this._playerToAct = firstToAct;
    this._lastAggressiveActor = firstToAct;
    this._numActivePlayers = activePlayers.filter((player) => !!player).length;
    this._actionTakenInRound = activePlayers.map((_) => false);

    assert(firstToAct < activePlayers.length);
  }

  activePlayers(): boolean[] {
    return this._activePlayers;
  }

  nonFoldedPlayers(): boolean[] {
    return this._nonFoldedPlayers;
  }

  actionTakenInRound(): boolean[] {
    return this._actionTakenInRound;
  }

  playerToAct(): SeatIndex {
    return this._playerToAct;
  }

  lastAggressiveActor(): SeatIndex {
    return this._lastAggressiveActor;
  }

  numActivePlayers(): number {
    return this._numActivePlayers;
  }

  inProgress(): boolean {
    return (
      (this._contested || this._numActivePlayers > 1) &&
      (this._firstAction || this._playerToAct !== this._lastAggressiveActor)
    );
  }

  isContested(): boolean {
    return this._contested;
  }

  actionTaken(action: Action, isManualLeave: boolean = false): void {
    assert(this.inProgress());
    assert(!(action & Action.PASSIVE && action & Action.AGGRESSIVE));

    if (this._firstAction) {
      this._firstAction = false;
    }

    // Implication: if there is aggressive action => the next player is contested
    if (action & Action.AGGRESSIVE) {
      this._lastAggressiveActor = this._playerToAct;
      this._contested = true;
    } else if (action & Action.PASSIVE) {
      this._contested = true;
    }

    if (action & Action.LEAVE) {
      this._activePlayers[this._playerToAct] = false;
      if (isManualLeave) {
        this._nonFoldedPlayers[this._playerToAct] = false;
      }
      --this._numActivePlayers;
    }

    this._actionTakenInRound[this._playerToAct] = true;

    this.incrementPlayer();
  }

  standUp(seat: number): void {
    this._activePlayers[seat] = false;
    this._nonFoldedPlayers[seat] = false;
    this._numActivePlayers = this._activePlayers.filter(
      (player) => !!player
    ).length;
  }

  private incrementPlayer(): void {
    do {
      ++this._playerToAct;
      if (this._playerToAct === this._activePlayers.length)
        this._playerToAct = 0;
      if (this._playerToAct === this._lastAggressiveActor) break;
    } while (!this._activePlayers[this._playerToAct]);
  }
}
