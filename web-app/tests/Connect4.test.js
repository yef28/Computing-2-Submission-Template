import assert from "node:assert";
import Connect4 from "../Connect4.js";

describe("Connect4.empty_board", function () {
    it("creates a standard 7 wide, 6 high board by default", function () {
        const board = Connect4.empty_board();
        assert.deepEqual(Connect4.size(board), [7, 6]);
    });
    it("creates a board of the requested width and height", function () {
        const board = Connect4.empty_board(4, 5);
        assert.deepEqual(Connect4.size(board), [4, 5]);
    });
    it("creates a board where every slot is empty", function () {
        const board = Connect4.empty_board();
        const flattened = board.flat();
        assert.ok(flattened.every((slot) => slot === 0));
    });
});

describe("Connect4.player_to_ply", function () {
    it("returns player 1 for an empty board", function () {
        const board = Connect4.empty_board();
        assert.equal(Connect4.player_to_ply(board), 1);
    });
    it("returns player 2 after player 1 has made one move", function () {
        const board = Connect4.ply(1, 0, Connect4.empty_board());
        assert.equal(Connect4.player_to_ply(board), 2);
    });
    it("returns player 1 again after both players have moved once", function () {
        let board = Connect4.empty_board();
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        assert.equal(Connect4.player_to_ply(board), 1);
    });
});

describe("Connect4.ply", function () {
    it("places a token in the lowest empty row of the chosen column", function () {
        const board = Connect4.ply(1, 3, Connect4.empty_board());
        assert.equal(board[3][0], 1);
    });
    it("stacks a second token in the same column on top of the first", function () {
        let board = Connect4.empty_board();
        board = Connect4.ply(1, 3, board);
        board = Connect4.ply(2, 3, board);
        assert.equal(board[3][0], 1);
        assert.equal(board[3][1], 2);
    });
    it("does not mutate the board passed in", function () {
        const original = Connect4.empty_board();
        Connect4.ply(1, 0, original);
        assert.equal(original[0][0], 0);
    });
    it("returns undefined if it is not that token's turn to ply", function () {
        const board = Connect4.empty_board();
        const result = Connect4.ply(2, 0, board);
        assert.equal(result, undefined);
    });
    it("returns undefined if the chosen column is full", function () {
        let board = Connect4.empty_board(7, 2);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 0, board);
        const result = Connect4.ply(1, 0, board);
        assert.equal(result, undefined);
    });
    it("returns undefined if the game has already ended", function () {
        let board = Connect4.empty_board();
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board); // Player 1 wins with 4 vertical.
        const result = Connect4.ply(2, 2, board);
        assert.equal(result, undefined);
    });
});

describe("Connect4.is_winning_for_player - vertical", function () {
    it("is false for a fresh empty board", function () {
        const board = Connect4.empty_board();
        assert.equal(Connect4.is_winning_for_player(1, board), false);
    });
    it("is true when a player has four tokens stacked in one column", function () {
        let board = Connect4.empty_board();
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        assert.equal(Connect4.is_winning_for_player(1, board), true);
        assert.equal(Connect4.is_winning_for_player(2, board), false);
    });
});

describe("Connect4.is_winning_for_player - horizontal", function () {
    it("is true when a player has four tokens in a row", function () {
        // Player 1 plies the bottom row of columns 0-3 in turn, with
        // player 2 plying column 4 in between purely to keep turn order
        // valid (their tokens don't interfere with player 1's row).
        let board = Connect4.empty_board();
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 4, board);
        board = Connect4.ply(1, 1, board);
        board = Connect4.ply(2, 4, board);
        board = Connect4.ply(1, 2, board);
        board = Connect4.ply(2, 4, board);
        board = Connect4.ply(1, 3, board);
        assert.equal(Connect4.is_winning_for_player(1, board), true);
        assert.equal(Connect4.is_winning_for_player(2, board), false);
    });
});

describe("Connect4.is_ended", function () {
    it("is false for a fresh empty board", function () {
        assert.equal(Connect4.is_ended(Connect4.empty_board()), false);
    });
    it("is true once a player has won", function () {
        let board = Connect4.empty_board();
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        assert.equal(Connect4.is_ended(board), true);
    });
    it("is true when the board is completely full with no winner", function () {
        // A 1x4 board filled with alternating tokens never produces 4 in a row
        // horizontally and is too narrow to, so it ends in a draw once full.
        let board = Connect4.empty_board(1, 4);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 0, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 0, board);
        assert.equal(Connect4.is_ended(board), true);
        assert.equal(Connect4.is_winning_for_player(1, board), false);
        assert.equal(Connect4.is_winning_for_player(2, board), false);
    });
});

describe("Connect4.free_columns", function () {
    it("lists every column index for a fresh empty board", function () {
        const board = Connect4.empty_board();
        assert.deepEqual(Connect4.free_columns(board), [0, 1, 2, 3, 4, 5, 6]);
    });
    it("excludes a column once it has been filled to the top", function () {
        let board = Connect4.empty_board(7, 1);
        board = Connect4.ply(1, 0, board);
        assert.deepEqual(Connect4.free_columns(board), [1, 2, 3, 4, 5, 6]);
    });
});

describe("Connect4.winning_slots", function () {
    it("returns an empty array when nobody has won", function () {
        assert.deepEqual(Connect4.winning_slots(Connect4.empty_board()), []);
    });
    it("returns the four coordinates that make up a vertical win", function () {
        let board = Connect4.empty_board();
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        board = Connect4.ply(2, 1, board);
        board = Connect4.ply(1, 0, board);
        const slots = Connect4.winning_slots(board);
        assert.equal(slots.length, 4);
        slots.forEach(function ([column_index]) {
            assert.equal(column_index, 0);
        });
    });
});
