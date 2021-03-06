import './TeamsSettingsPage.scss';
import effects from '../../data/effects';
import teams, { update } from '../../service/teams';
import lang from '../../service/lang';
import { requestRedraw } from '../../util/animation';
/* eslint-disable no-unused-vars */
import m from 'mithril';
/* eslint-enable no-unused-vars */

const DUPLICATE_TITLES = {
    2: 'double',
    3: 'triple',
    4: 'quadruple',
    5: 'quintuple',
};

const Slider = {
    view(ctrl, args) {
        const { object, field } = args;
        return (
            <input
                class="field-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={ parseInt(object[ field ] * 100, 10) }
                oninput={ (event) => {
                    object[ field ] = event.target.value / 100;
                    update();
                    requestRedraw(10);
                } }
            />
        );
    },
};

const TeamsSettingsPage = {
    view() {
        const effectSliders = effects.map(({ attr }) => (
            <div class="field">
                <label class="field-name">{ lang.get(`effect-${ attr.uid }-name`) }</label>
                <div class="field-input">
                    <Slider object={ teams.weights } field={ `effect-${ attr.uid }` } />
                    <span class="field-value">
                        { (teams.weights[ `effect-${ attr.uid }` ] * 1000 | 0) / 10 }
                    </span>
                </div>
            </div>
        ));
        const duplicateSliders = [ 2, 3, 4, 5 ].map((count) => (
            <div class="field">
                <label class="field-name">
                    { lang.get(DUPLICATE_TITLES[ count ]) }
                    { `(${ count }x)` }
                </label>
                <div class="field-input">
                    <Slider object={ teams.weights } field={ `duplicates-${ count }` } />
                    <span class="field-value">
                        { (teams.weights[ `duplicates-${ count }` ] * 1000 | 0) / 10 }
                    </span>
                </div>
            </div>
        ));
        return (
            <div class="teams-settings">
                <div class="header">
                    { lang.get('synergy-weights') }
                </div>
                { effectSliders }
                <div class="header">
                    { lang.get('duplicate-weights') }
                </div>
                { duplicateSliders }
                <div class="clear" />
            </div>
        );
    },
};

export default TeamsSettingsPage;
