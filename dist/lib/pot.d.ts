import { SeatIndex } from 'types/seat-index';
import { Chips } from 'types/chips';
import { SeatArray } from 'types/seat-array';
export interface RakeInfo {
    totalRake: number;
    rakePerPlayer: {
        [key: number]: number;
    };
}
export default class Pot {
    private _eligiblePlayers;
    private _size;
    private _aggregateFoldedAmountAdded;
    private _numberPlayersWithNonZeroBet;
    private _uncalledChips;
    private _rakeInfo;
    size(): Chips;
    eligiblePlayers(): SeatIndex[];
    removePlayer(player: SeatIndex): void;
    add(amount: Chips, isFoldedBet?: boolean): void;
    collectBetsFrom(players: SeatArray): Chips;
    totalNumberOfBets(): number;
    uncalledChips(): number;
    setUncalledChips(amount: number): void;
    setTotalRake(amount: number): void;
    addToIndividualRake(amount: number, index: number): void;
    rake(): RakeInfo;
}
