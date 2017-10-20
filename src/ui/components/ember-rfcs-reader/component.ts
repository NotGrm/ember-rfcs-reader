import Component, { tracked } from '@glimmer/component';
import Navigo from 'navigo';

const router = new Navigo(null, true);

export default class EmberRfcsReader extends Component {

  @tracked state = {
    filter: 'open',
    current: null,
    page: 1,
    rateLimit: 0,
    rateLimitRemaining: 0,
    rateLimitReset: 0,
    hasPrev: false,
    hasNext: false,
    pullRequests: [],
  }

  @tracked('state')
  get hasNoPrev() {
    return !this.state.hasPrev;
  }

  @tracked('state')
  get hasNoNext() {
    return !this.state.hasNext;
  }

  @tracked('state')
  get rateLimitResetRemaining() {
    if(this.state.rateLimitReset == 0) {
      return 0;
    }
    
    return this.state.rateLimitReset - Math.round(Date.now() / 1000.0)
  }

  @tracked('state')
  get allSelected() {    
    return this.state.filter === 'all';
  }

  @tracked('state')
  get openSelected() {
    return this.state.filter === 'open';
  }

  @tracked('state')
  get closedSelected() {
    return this.state.filter === 'closed';
  }

  constructor(options) {
    super(options);

    const { filter, page } = this.state;

    this.loadPulls(filter, page).then(() => {
      router.resolve();
    });

    router.on({
      '/pull_requests/:id': (params) => {        
        let current = this.state.pullRequests.find(pr => pr.number === Number(params.id));

        this.loadContent(current).then(content => {
          let pullRequest = {
            number: current.number,
            title: current.title,
            content 
          }
          
          this.state = {
            ...this.state,
            current: pullRequest
          }
        })
      }
    })
  }

  async loadPulls(filter, page) {
    let response = await fetch(`https://api.github.com/repos/emberjs/rfcs/pulls?page=${page}&state=${filter}`);
    
    this.parseRateLimitHeaders(response.headers);
    let pullRequests = [];

    if(response.status == 200) {
      this.parseLinkHeader(response.headers);
      pullRequests = await response.json();
    } 

    this.state = {
      ...this.state,
      filter,
      page,
      pullRequests
    }
  }

  async loadContent(pr) {    
    const { body, head } = pr;
    const { ref, repo } = head;

    let response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/text/0000-${ref}.md?ref=${ref}`);
    let file = await response.json();   
    
    return atob(file.content);
  }

  changePage(direction, event) {
    event.preventDefault();

    const { page } = this.state;
    let newPage = page + direction === 'next' ? 1 : -1

    this.loadPulls(this.state.filter, newPage);
  }

  filterPullRequests(filter) {    
    this.loadPulls(filter, 1);
  }

  parseRateLimitHeaders(headers: Headers) {
    this.state = {
      ...this.state,
      rateLimit: Number.parseInt(headers.get('X-RateLimit-Limit')),
      rateLimitRemaining: Number.parseInt(headers.get('X-RateLimit-Remaining')),
      rateLimitReset: Number.parseInt(headers.get('X-RateLimit-Reset'))
    }
  }

  parseLinkHeader(headers: Headers) {
    let hasPrev = false;
    let hasNext = false;

    headers.get('Link').split(',').forEach(link => {
      let [url, rel] = link.split(';')

      if (rel.includes('next')) {
        hasNext = true;
        return;
      }
      if (rel.includes('prev')) {
        hasPrev = true;
      }
    })

    this.state = {
      ...this.state,
      hasPrev,
      hasNext
    }
  }
}
