/**
 * Countries.js is a small data module listing a shortlist of countries
 * competing in the 2026 FIFA World Cup, used to assign each player
 * a flag-themed token in World Cup Connect 4.
 * @namespace Countries
 * @author
 * @version 2025/26
 */
const Countries = Object.create(null);

/**
 * @memberof Countries
 * @typedef {Object} Country
 * @property {string} name The country's name.
 * @property {string} flag The country's flag, as an emoji.
 */

/**
 * A shortlist of countries competing in the 2026 FIFA World Cup.
 * Limited to a small set of visually distinct flags for ease of play.
 * @memberof Countries
 * @type {Countries.Country[]}
 */
Countries.shortlist = Object.freeze([
    Object.freeze({"name": "Argentina", "flag": "🇦🇷"}),
    Object.freeze({"name": "Brazil", "flag": "🇧🇷"}),
    Object.freeze({"name": "England", "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿"}),
    Object.freeze({"name": "France", "flag": "🇫🇷"}),
    Object.freeze({"name": "Germany", "flag": "🇩🇪"}),
    Object.freeze({"name": "Japan", "flag": "🇯🇵"}),
    Object.freeze({"name": "Morocco", "flag": "🇲🇦"}),
    Object.freeze({"name": "Spain", "flag": "🇪🇸"}),
    Object.freeze({"name": "USA", "flag": "🇺🇸"}),
    Object.freeze({"name": "Mexico", "flag": "🇲🇽"})
]);

export default Object.freeze(Countries);