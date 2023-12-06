import ChipRange from './chip-range';
import { SeatIndex } from 'types/seat-index';
import { Chips } from 'types/chips';
import { SeatArray } from 'types/seat-array';
import { Blinds } from 'types/blinds';
import { RoundOfBetting } from './community-cards';
export declare enum Action {
    LEAVE = 0,
    MATCH = 1,
    RAISE = 2
}
export declare class ActionRange {
    canRaise: boolean;
    chipRange: ChipRange;
    constructor(canRaise: boolean, chipRange?: ChipRange);
}
export default class BettingRound {
    private _players;
    private _round;
    private _biggestBet;
    private _biggestCall;
    private _minRaise;
    private _blinds;
    private _roundOfBetting;
    constructor(players: SeatArray, nonFoldedPlayers: boolean[], firstToAct: SeatIndex, minRaise: Chips, blinds: Blinds, roundOfBetting: RoundOfBetting, biggestBet?: Chips);
    inProgress(): boolean;
    isContested(): boolean;
    playerToAct(): SeatIndex;
    biggestBet(): Chips;
    minRaise(): Chips;
    players(): SeatArray;
    activePlayers(): boolean[];
    nonFoldedPlayers(): boolean[];
    actionTakenInRound(): boolean[];
    numActivePlayers(): number;
    biggestCall(): number;
    legalActions(): ActionRange;
    actionTaken(action: Action, bet?: Chips): void;
    standUp(seat: number): void;
    isRaiseValid(bet: Chips): boolean;
}
