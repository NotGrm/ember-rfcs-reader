import Component, { tracked } from '@glimmer/component';

export default class RfcItem extends Component {

  @tracked('args')
  get badgeClass() {
    let state = this.args.item.state;
    
    switch (state) {
      case "open": return 'badge badge-success'
      case "closed": return 'badge badge-danger'
      default: return 'badge badge-secondary'
    }
  }
};
