import Pot from './pot';
import { SeatArray } from 'types/seat-array';
export default class PotManager {
    private readonly _pots;
    private _aggregateFoldedBets;
    private _nonZeroFoldedBets;
    constructor();
    pots(): Pot[];
    betFolded(amount: any): void;
    resetFoldCount(): void;
    removePlayerFromPots(player: number): void;
    getFoldedBetsContributions(minBet: number): number;
    collectBetsFrom(players: SeatArray): void;
}
