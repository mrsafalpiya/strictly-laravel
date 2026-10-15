// @ts-check
/**
 * Problem P-136: the form of a pluralised message that `choice()` renders, picked exactly as Laravel's
 * `Illuminate\Translation\MessageSelector::choose()` picks it for `trans_choice()`, so the client and the server
 * render the same text. Keep it in step with that class.
 *
 * A message's forms are separated by `|`. A form may start with a condition, `{n}` or `[from,to]` (`*` leaving a range
 * open); the first form whose condition holds the count wins, trimmed. When none does, the conditions are stripped and
 * the locale's plural rule picks a form by its index, the first form standing in for a missing one.
 */

/** A form's leading condition and its text, as MessageSelector matches them. */
const condition = /^[{[]([-?\d|*,.]*)[}\]](.*)/s;

/** A string PHP 8 treats as numeric in a comparison with a number. */
const numeric = /^[ \t\n\r\v\f]*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[ \t\n\r\v\f]*$/;

/**
 * @param {string} message
 * @param {number} count
 * @param {string} locale the locale whose message it is
 * @returns {string}
 */
export function chooseForm(message, count, locale) {
    const forms = message.split('|');

    for (const form of forms) {
        const text = matchCondition(form, count);

        if (text !== undefined) {
            return phpTrim(text);
        }
    }

    const stripped = forms.map((form) => form.replace(/^[{[][-?\d|*,.]*[}\]]/, ''));
    const index = pluralIndex(locale, count);

    return stripped.length === 1 || stripped[index] === undefined ? (stripped[0] ?? '') : stripped[index];
}

/**
 * The form's text when its condition holds the count, as `MessageSelector::extractFromString()` decides it, with
 * PHP 8's comparison of a number to a string.
 *
 * @param {string} form
 * @param {number} count
 * @returns {string | undefined}
 */
function matchCondition(form, count) {
    const match = condition.exec(form);

    if (match === null) {
        return undefined;
    }

    const [, held = '', text = ''] = match;

    if (held.includes(',')) {
        const comma = held.indexOf(',');
        const from = held.slice(0, comma);
        const to = held.slice(comma + 1);

        if (to === '*' && compare(count, from) >= 0) {
            return text;
        } else if (from === '*' && compare(count, to) <= 0) {
            return text;
        } else if (compare(count, from) >= 0 && compare(count, to) <= 0) {
            return text;
        }
    }

    return compare(count, held) === 0 ? text : undefined;
}

/**
 * PHP 8's `$number <=> $string`: numerically when the string is numeric, else as strings.
 *
 * @param {number} number
 * @param {string} string
 */
function compare(number, string) {
    if (numeric.test(string)) {
        const other = Number(string.trim());

        return number < other ? -1 : number > other ? 1 : 0;
    }

    const text = String(number);

    return text < string ? -1 : text > string ? 1 : 0;
}

/** @param {string} text PHP's `trim()`, which strips fewer characters than `String.prototype.trim()`. */
function phpTrim(text) {
    return text.replace(/^[ \t\n\r\0\x0B]+|[ \t\n\r\0\x0B]+$/g, '');
}

/**
 * The index of the form the locale's plural rule picks, from `MessageSelector::getPluralIndex()` (itself from the Zend
 * Framework). A locale it doesn't list, such as `pt-BR` written with a hyphen, takes the first form.
 *
 * @param {string} locale
 * @param {number} count
 */
export function pluralIndex(locale, count) {
    const rule = rules.get(locale);

    return rule === undefined ? 0 : rule(Math.abs(count));
}

/** @type {Array<[string, (n: number) => number]>} */
const ruleTable = [
    [
        'az az_AZ bo bo_CN bo_IN dz dz_BT id id_ID ja ja_JP jv ka ka_GE km km_KH kn kn_IN ko ko_KR ms ms_MY th th_TH tr tr_CY tr_TR vi vi_VN zh zh_CN zh_HK zh_SG zh_TW',
        () => 0,
    ],
    [
        'af af_ZA bn bn_BD bn_IN bg bg_BG ca ca_AD ca_ES ca_FR ca_IT da da_DK de de_AT de_BE de_CH de_DE de_LI de_LU el el_CY el_GR en en_AG en_AU en_BW en_CA en_DK en_GB en_HK en_IE en_IN en_NG en_NZ en_PH en_SG en_US en_ZA en_ZM en_ZW eo eo_US es es_AR es_BO es_CL es_CO es_CR es_CU es_DO es_EC es_ES es_GT es_HN es_MX es_NI es_PA es_PE es_PR es_PY es_SV es_US es_UY es_VE et et_EE eu eu_ES eu_FR fa fa_IR fi fi_FI fo fo_FO fur fur_IT fy fy_DE fy_NL gl gl_ES gu gu_IN ha ha_NG he he_IL hu hu_HU is is_IS it it_CH it_IT ku ku_TR lb lb_LU ml ml_IN mn mn_MN mr mr_IN nah nb nb_NO ne ne_NP nl nl_AW nl_BE nl_NL nn nn_NO no om om_ET om_KE or or_IN pa pa_IN pa_PK pap pap_AN pap_AW pap_CW ps ps_AF pt pt_BR pt_PT so so_DJ so_ET so_KE so_SO sq sq_AL sq_MK sv sv_FI sv_SE sw sw_KE sw_TZ ta ta_IN ta_LK te te_IN tk tk_TM ur ur_IN ur_PK zu zu_ZA',
        (n) => (n === 1 ? 0 : 1),
    ],
    [
        'am am_ET bh fil fil_PH fr fr_BE fr_CA fr_CH fr_FR fr_LU gun hi hi_IN hy hy_AM ln ln_CD mg mg_MG nso nso_ZA ti ti_ER ti_ET wa wa_BE xbr',
        (n) => (n === 0 || n === 1 ? 0 : 1),
    ],
    [
        'be be_BY bs bs_BA hr hr_HR ru ru_RU ru_UA sr sr_ME sr_RS uk uk_UA',
        (n) => {
            const i = Math.trunc(n);

            return i % 10 === 1 && i % 100 !== 11 ? 0 : i % 10 >= 2 && i % 10 <= 4 && (i % 100 < 10 || i % 100 >= 20) ? 1 : 2;
        },
    ],
    ['cs cs_CZ sk sk_SK', (n) => (n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2)],
    ['ga ga_IE', (n) => (n === 1 ? 0 : n === 2 ? 1 : 2)],
    [
        'lt lt_LT',
        (n) => {
            const i = Math.trunc(n);

            return i % 10 === 1 && i % 100 !== 11 ? 0 : i % 10 >= 2 && (i % 100 < 10 || i % 100 >= 20) ? 1 : 2;
        },
    ],
    [
        'sl sl_SI',
        (n) => {
            const i = Math.trunc(n) % 100;

            return i === 1 ? 0 : i === 2 ? 1 : i === 3 || i === 4 ? 2 : 3;
        },
    ],
    ['mk mk_MK', (n) => (Math.trunc(n) % 10 === 1 ? 0 : 1)],
    [
        'mt mt_MT',
        (n) => {
            const i = Math.trunc(n) % 100;

            return n === 1 ? 0 : n === 0 || (i > 1 && i < 11) ? 1 : i > 10 && i < 20 ? 2 : 3;
        },
    ],
    [
        'lv lv_LV',
        (n) => {
            const i = Math.trunc(n);

            return n === 0 ? 0 : i % 10 === 1 && i % 100 !== 11 ? 1 : 2;
        },
    ],
    [
        'pl pl_PL',
        (n) => {
            const i = Math.trunc(n);

            return n === 1 ? 0 : i % 10 >= 2 && i % 10 <= 4 && (i % 100 < 12 || i % 100 > 14) ? 1 : 2;
        },
    ],
    ['cy cy_GB', (n) => (n === 1 ? 0 : n === 2 ? 1 : n === 8 || n === 11 ? 2 : 3)],
    [
        'ro ro_RO',
        (n) => {
            const i = Math.trunc(n) % 100;

            return n === 1 ? 0 : n === 0 || (i > 0 && i < 20) ? 1 : 2;
        },
    ],
    [
        'ar ar_AE ar_BH ar_DZ ar_EG ar_IN ar_IQ ar_JO ar_KW ar_LB ar_LY ar_MA ar_OM ar_QA ar_SA ar_SD ar_SS ar_SY ar_TN ar_YE',
        (n) => {
            const i = Math.trunc(n) % 100;

            return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : i >= 3 && i <= 10 ? 3 : i >= 11 && i <= 99 ? 4 : 5;
        },
    ],
];

/** @type {Map<string, (n: number) => number>} */
const rules = new Map(ruleTable.flatMap(([locales, rule]) => locales.split(' ').map((locale) => /** @type {const} */ ([locale, rule]))));
