import './Team.scss';
import deepEqual from 'deep-equal';
import classNames from 'classnames';
import { getImage } from '../util/images';
import effects, { effectImage } from '../data/effects';
import pure from '../util/pure';
import lang from '../service/lang';
import Champion from './Champion.jsx';
import ImageIcon from './ImageIcon.jsx';
import { requestRedraw } from '../util/animation';
/* eslint-disable no-unused-vars */
import m from 'mithril';
/* eslint-enable no-unused-vars */

const CHAMPION_SELECTED = 1;
const CHAMPION_NEIGHBOR = 2;
const EFFECT_SELECTED = true;

function selectChampion(ctrl, synergies, champions, index) {
    let selected = ctrl.champions[ index ];
    if(!selected) {
        selected = {
            active: true,
            champions: {
                [ index ]: CHAMPION_SELECTED,
            },
            effects: {},
        };
        const champion = champions[ index ];
        synergies.forEach((synergy) => {
            let amount;
            if(champion.attr.uid === synergy.attr.toId) {
                champions.forEach((champion, index) => {
                    if(champion.attr.uid === synergy.attr.fromId && champion.attr.stars === synergy.attr.fromStars)
                        selected.champions[ index ] = CHAMPION_NEIGHBOR;
                });
                amount = synergy.attr.effectAmount;
            }
            else if(champion.attr.uid === synergy.attr.fromId && champion.attr.stars === synergy.attr.fromStars) {
                champions.forEach((champion, index) => {
                    if(champion.attr.uid === synergy.attr.toId)
                        selected.champions[ index ] = CHAMPION_NEIGHBOR;
                });
                amount = synergy.attr.effectAmount;
            }
            if(amount) {
                selected.effects[ synergy.attr.effectId ] = (selected.effects[ synergy.attr.effectId ] || 0) + amount;
            }
        });
        ctrl.champions[ index ] = selected;
    }
    if(deepEqual(ctrl.selected, selected)) {
        ctrl.selected = {
            effects: {},
            champions: {},
        };
    }
    else {
        ctrl.selected = selected;
    }
    requestRedraw();
}

function selectSynergy(ctrl, synergies, champions, effectId) {
    let selected = ctrl.effects[ effectId ];
    if(!selected) {
        selected = {
            active: true,
            champions: {},
            effects: {
                [ effectId ]: EFFECT_SELECTED,
            },
        };
        const championIds = {};
        synergies
            .filter((synergy) => synergy.attr.effectId === effectId)
            .forEach((synergy) => {
                championIds[ synergy.attr.toId ] = true;
                championIds[ `${ synergy.attr.fromId }-${ synergy.attr.fromStars }` ] = true;
            });
        champions.forEach((champion, index) => {
            if(championIds[ champion.id ])
                selected.champions[ index ] = CHAMPION_NEIGHBOR;
            if(championIds[ champion.attr.uid ])
                selected.champions[ index ] = CHAMPION_SELECTED;
        });
        ctrl.effects[ effectId ] = selected;
    }
    if(deepEqual(ctrl.selected, selected)) {
        ctrl.selected = {
            effects: {},
            champions: {},
        };
    }
    else {
        ctrl.selected = selected;
    }
    requestRedraw();
}

const Team = {
    controller() {
        this.selected = {
            effects: {},
            champions: {},
        };
        this.champions = {};
        this.effects = {};
    },
    view(ctrl, args) {
        const { champions, synergies } = args;
        const size = champions.length;
        ctrl.pure = champions.reduce((value, champion) => {
            if(value) {
                const image = getImage(`images/champions/portrait_${ champion.attr.uid }.png`);
                if(!image)
                    return false;
            }
            return value;
        }, true);
        return(
            <div
                class={ classNames('team', `team--size-${ size }`, { 'team--selected': ctrl.selected.active }) }
            >
                <div>
                { champions.map((champion, index) => {
                    const selected = ctrl.selected.champions[ index ] === CHAMPION_SELECTED;
                    const neighbor = ctrl.selected.champions[ index ] === CHAMPION_NEIGHBOR;
                    return (
                        <Champion
                            key={ `champion-${ index }` }
                            champion={ champion }
                            selected={ selected }
                            neighbor={ neighbor }
                            onclick={ () => selectChampion(ctrl, synergies, champions, index) }
                        />
                    );
                }) }
                </div>
                <div className="team-synergies">
                { effects.map((effect) => {
                    const synergy = synergies.filter((synergy) => synergy.attr.effectId === effect.attr.uid);
                    if(synergy.length === 0)
                        return null;
                    const selected = ctrl.selected.effects[ effect.attr.uid ];
                    const amount = (!selected || selected === EFFECT_SELECTED)?
                        synergy.reduce((value, synergy) => value + synergy.attr.effectAmount, 0):
                        selected;
                    return (
                        <div
                            class={ classNames('team-synergy', { 'team-synergy--selected': selected }, 'no-select') }
                            onclick={ () => selectSynergy(ctrl, synergies, champions, effect.attr.uid) }
                        >
                            <ImageIcon src={ effectImage(effect.attr.uid) } icon="square"/>
                            <span class="effect-name">
                                { lang.get(`effect-${ effect.attr.uid }-name`) }
                            </span>
                            <span class="effect-amount">
                                { amount }%
                            </span>
                        </div>
                    );
                })}
                </div>
            </div>
        );
    },
};

export default pure(Team);
