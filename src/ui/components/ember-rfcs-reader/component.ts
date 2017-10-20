import Component, { tracked } from '@glimmer/component';
import Navigo from 'navigo';

const router = new Navigo(null, true);
const GITHUB_REPOS_API_URL = 'https://api.github.com/repos';
const EMBERJS_RFCS_REPO = 'emberjs/rfcs';

export default class EmberRfcsReader extends Component {

  @tracked state = {
    filter: 'open',
    page: 1,
    rateLimit: 0,
    rateLimitRemaining: 0,
    rateLimitReset: 0,
    hasPrev: false,
    hasNext: false,
    errorMessage: undefined,
    current: undefined,
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

    this.loadRfcList(filter, page).then(() => {
      router.resolve();
    });

    router.on({
      '/pull_requests/:id': (params) => {        
        let current = this.state.pullRequests.find(pr => pr.number === Number(params.id));

        if(current) {
          this.loadRfcContent(current)
        } else {
          this.state = {
            ...this.state,
            errorMessage: `Cannot find RFC with number ${params.id}`
          }
        }

      }
    })
  }

  async loadRfcList(filter, page) {
    let response = await fetch(`${GITHUB_REPOS_API_URL}/${EMBERJS_RFCS_REPO}/pulls?page=${page}&state=${filter}`);
    
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

  async loadRfcContent(pr) {    
    const { body, head } = pr;
    const { ref, repo } = head;

    let response = await fetch(`${GITHUB_REPOS_API_URL}/${repo.full_name}/contents/text?ref=${ref}`);
    let files = await response.json();

    let file = files.find(f => f.name.includes('0000'))
    let content = await this.getFileContent(file.url)

    let pullRequest = {
      number: pr.number,
      title: pr.title,
      body: atob(content)
    }
    
    this.state = {
      ...this.state,
      errorMessage: undefined,
      current: pullRequest
    }
  }

  async getFileContent(url) {
    let response = await fetch(url)
    let file = await response.json()

    return file.content
  }

  changePage(direction, event) {
    event.preventDefault();

    const { page } = this.state;
    let newPage = page + direction === 'next' ? 1 : -1

    this.loadRfcList(this.state.filter, newPage);
  }

  filterPullRequests(filter) {    
    this.loadRfcList(filter, 1);
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
