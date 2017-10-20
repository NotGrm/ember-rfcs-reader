import Component, { tracked } from '@glimmer/component';

export default class RfcList extends Component {
  @tracked state = {
    filter: 'open'
  }

  selectFilter(filter) {
    this.state = {
      ...this.state,
      filter
    }

    this.args.onFilterClick(filter);
  }
};
