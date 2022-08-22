import { SeatArray } from '../../src/types/seat-array';
import PotManager from '../../src/lib/pot-manager';
import Player from '../../src/lib/player';

describe('Pot Manager', () => {
  test('collect bets', () => {
    const players: SeatArray = new Array(9).fill(null);
    players[0] = new Player(100);
    players[1] = new Player(100);
    players[2] = new Player(100);
    players[0].bet(20);
    players[1].bet(40);
    players[2].bet(60);
    const potManager = new PotManager();
    potManager.collectBetsFrom(players);
    expect(potManager.pots().length).toBe(3);
    expect(potManager.pots()[0].size()).toBe(60);
    expect(potManager.pots()[1].size()).toBe(40);
    expect(potManager.pots()[2].size()).toBe(20);
  });

  test('Short stack who went all in is not excluded from main pot when others go all in later', () => {
    const players: SeatArray = new Array(9).fill(null);
    players[0] = new Player(100);
    players[1] = new Player(200);
    players[2] = new Player(200);
    players[0].bet(100);
    players[1].bet(100);
    players[2].bet(100);
    const potManager = new PotManager();
    potManager.collectBetsFrom(players);
    expect(potManager.pots().length).toBe(2);
    expect(potManager.pots()[0].size()).toBe(300);
    players[1].bet(100);
    players[2].bet(100);
    potManager.collectBetsFrom(players);
    expect(potManager.pots()[0].size()).toBe(300);
    expect(potManager.pots()[1].size()).toBe(200);
  });
});
