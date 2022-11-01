import { SeatIndex } from 'types/seat-index';
export declare enum Action {
    LEAVE = 1,
    PASSIVE = 2,
    AGGRESSIVE = 4
}
export default class Round {
    private readonly _activePlayers;
    private readonly _nonFoldedPlayers;
    private _playerToAct;
    private _lastAggressiveActor;
    private _contested;
    private _firstAction;
    private _numActivePlayers;
    private _actionTakenInRound;
    constructor(activePlayers: boolean[], nonFoldedPlayers: boolean[], firstToAct: SeatIndex);
    activePlayers(): boolean[];
    nonFoldedPlayers(): boolean[];
    actionTakenInRound(): boolean[];
    playerToAct(): SeatIndex;
    lastAggressiveActor(): SeatIndex;
    numActivePlayers(): number;
    inProgress(): boolean;
    isContested(): boolean;
    actionTaken(action: Action, isManualLeave?: boolean): void;
    standUp(seat: number): void;
    private incrementPlayer;
}
