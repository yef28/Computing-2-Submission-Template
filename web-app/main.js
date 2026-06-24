/*jslint browser */
import R from "./ramda.js";
import Connect4 from "./Connect4.js";
import Stats4 from "./Stats4.js";
import Countries from "./Countries.js";

// String literals.
const draw_message = "It's a draw. Both teams progress to a replay.";
const advance_message = "advance to the next round!";

const game_board = document.getElementById("game_board");
const result_dialog = document.getElementById("result_dialog");

// This is my helper function to shorten document.getElementById.
const el = (id) => document.getElementById(id);

/**
 * Pick two distinct countries at random from the shortlist.
 * Picks the first country uniformly at random, then picks the second
 * uniformly at random from the remaining countries, guaranteeing the
 * pair is always two different countries.
 * @returns {Countries.Country[]} A pair of [home_country, away_country].
 */
const random_country_pair = function () {
    const pool = Countries.shortlist;
    const home = pool[Math.floor(Math.random() * pool.length)];
    const remaining = pool.filter((country) => country !== home);
    const away = remaining[Math.floor(Math.random() * remaining.length)];
    return [home, away];
};

// Home player is always token 1 (plies first), Away is always token 2.
// Both are randomly assigned a distinct country each match.
let home_country;
let away_country;
let board;

const token_flags = function () {
    return ["", home_country.flag, away_country.flag];
};

const slot_elements = R.range(0, 7).map(function (column_index) {
    const column_div = document.createElement("div");
    column_div.className = "column";
    column_div.tabIndex = 0;
    column_div.setAttribute("aria-label", `Column ${column_index + 1}`);

    column_div.onclick = function () {
        const free_columns = Connect4.free_columns(board);
        if (!free_columns.includes(column_index)) {
            return;
        }
        const player = Connect4.player_to_ply(board);
        board = Connect4.ply(player, column_index, board);
        redraw_board();

        if (Connect4.is_ended(board)) {
            let result;
            let winning_country;
            if (Connect4.is_winning_for_player(1, board)) {
                result = 1;
                winning_country = home_country;
            } else if (Connect4.is_winning_for_player(2, board)) {
                result = 2;
                winning_country = away_country;
            } else {
                result = 0;
            }

            if (result === 0) {
                el("result_winner").textContent = "Full time draw";
                el("result_message").textContent = draw_message;
            } else {
                el("result_winner").textContent = (
                    `${winning_country.flag} ${winning_country.name}`
                );
                el("result_message").textContent = (
                    `${winning_country.name} ${advance_message}`
                );
            }

            const stats = Stats4.record_game(
                home_country.name,
                away_country.name,
                result
            );
            update_statistics(stats);

            result_dialog.showModal();
        }
    };

    column_div.onkeydown = function (event) {
        if (
            event.key === "Enter" ||
            event.key === " " ||
            event.key === "ArrowDown"
        ) {
            column_div.onclick();
        }
        if (event.key === "ArrowLeft" && column_div.previousSibling) {
            column_div.previousSibling.focus();
        }
        if (event.key === "ArrowRight" && column_div.nextSibling) {
            column_div.nextSibling.focus();
        }
    };

    game_board.append(column_div);

    return R.reverse(R.range(0, 6).map(function () {
        const slot = document.createElement("div");
        slot.className = "slot";
        column_div.append(slot);
        return slot;
    }));
});

const redraw_board = function () {
    const flags = token_flags();
    slot_elements.forEach(function (column, column_index) {
        column.forEach(function (slot, row_index) {
            const token = board[column_index][row_index];
            slot.textContent = flags[token];
            slot.className = (
                token === 0
                ? "slot free"
                : "slot filled"
            );
        });
    });
    Connect4.winning_slots(board).forEach(function ([column_index, row_index]) {
        const slot = slot_elements[column_index][row_index];
        slot.className += " winning";
    });

    const to_ply = Connect4.player_to_ply(board);
    if (to_ply === 1) {
        el("home_ready").textContent = "Up next!";
        el("away_ready").textContent = "Waiting…";
    } else {
        el("home_ready").textContent = "Waiting…";
        el("away_ready").textContent = "Up next!";
    }
};

const update_team_labels = function () {
    el("home_team_name").textContent = home_country.name;
    el("home_token_preview").textContent = home_country.flag;
    el("away_team_name").textContent = away_country.name;
    el("away_token_preview").textContent = away_country.flag;
};

const update_statistics = function (stats) {
    const stats_home = stats[home_country.name];
    const stats_away = stats[away_country.name];

    el("home_elo").textContent = Math.round(stats_home.elo);
    el("home_p1_wins").textContent = stats_home.player_1_wins;
    el("home_p1_losses").textContent = stats_home.player_1_losses;
    el("home_p1_draws").textContent = stats_home.player_1_draws;
    el("home_p2_wins").textContent = stats_home.player_2_wins;
    el("home_p2_losses").textContent = stats_home.player_2_losses;
    el("home_p2_draws").textContent = stats_home.player_2_draws;
    el("home_current_streak").textContent = stats_home.current_streak;
    el("home_longest_streak").textContent = stats_home.longest_streak;

    el("away_elo").textContent = Math.round(stats_away.elo);
    el("away_p1_wins").textContent = stats_away.player_1_wins;
    el("away_p1_losses").textContent = stats_away.player_1_losses;
    el("away_p1_draws").textContent = stats_away.player_1_draws;
    el("away_p2_wins").textContent = stats_away.player_2_wins;
    el("away_p2_losses").textContent = stats_away.player_2_losses;
    el("away_p2_draws").textContent = stats_away.player_2_draws;
    el("away_current_streak").textContent = stats_away.current_streak;
    el("away_longest_streak").textContent = stats_away.longest_streak;
};

/**
 * Start a brand new match: randomly assign two distinct countries,
 * reset the board, and refresh every part of the display.
 */
const start_new_match = function () {
    [home_country, away_country] = random_country_pair();
    board = Connect4.empty_board();
    update_team_labels();
    update_statistics(
        Stats4.get_statistics([home_country.name, away_country.name])
    );
    redraw_board();
};

result_dialog.onclick = function () {
    result_dialog.close();
    start_new_match();
};

result_dialog.onkeydown = result_dialog.onclick;

// Kick off the very first match.
start_new_match();
game_board.firstChild.focus();