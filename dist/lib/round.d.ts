import { SeatIndex } from 'types/seat-index';
export declare enum Action {
    LEAVE = 1,
    PASSIVE = 2,
    AGGRESSIVE = 4
}
export default class Round {
    private readonly _activePlayers;
    private readonly _positivePlayers;
    private _playerToAct;
    private _lastAggressiveActor;
    private _contested;
    private _firstAction;
    private _numActivePlayers;
    constructor(activePlayers: boolean[], positivePlayers: boolean[], firstToAct: SeatIndex);
    activePlayers(): boolean[];
    positivePlayers(): boolean[];
    playerToAct(): SeatIndex;
    lastAggressiveActor(): SeatIndex;
    numActivePlayers(): number;
    inProgress(): boolean;
    isContested(): boolean;
    actionTaken(action: Action, isRealLeave?: boolean): void;
    standUp(seat: number): void;
    private incrementPlayer;
}
