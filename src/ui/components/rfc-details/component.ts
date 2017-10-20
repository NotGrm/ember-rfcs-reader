import Component, { tracked } from '@glimmer/component';
import Showdown from 'showdown';

const converter = new Showdown.Converter();

export default class RfcDetails extends Component {
  @tracked state = {
    content: ''
  }

  @tracked('args')
  get markdown() {
    if(this.args.item == undefined) {
      return ''
    }

    return converter.makeHtml(this.args.item.body);
  }
};