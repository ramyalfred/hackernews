import logo from './logo.svg';
import loading from './assets/loading.svg'
import './App.css';
import { Component } from 'react';


const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const largeColumn = {
  width: "40%",
};

const midColumn = {
  width: "30%",
};

const smallColumn = {
  width: "10%",
};

//const isSearched = searchTerm => item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearch = this.fetchSearch.bind(this);
  }

  setSearchTopStories(result){
    this.setState({result});
  };

  onDismiss(id){
    const isNotId = item => item.objectID !== id;
    const updatedList = this.state.result.hits.filter(isNotId);

    //Override the hits in the result object with the ones in this custom object
    this.setState({
        result: {...this.state.result, hits: updatedList},  
    });
  }

  onSearchChange(event){
    this.setState({searchTerm: event.target.value});
  }

  onSearchSubmit(event){
    event.preventDefault();
    const{searchTerm} = this.state;
    this.fetchSearch(searchTerm);
  };

  render() {
    const {result,searchTerm} = this.state;

    return(
        <div className="page">
          <div className='interactions'>
            <Search 
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}
            >
              Search
            </Search>
          </div>
          {result?
          <Table
            list={result.hits}
            onDismiss={this.onDismiss}
          />: <Loading/>}
        </div>
    );
  }

  fetchSearch(searchTerm){

    //Fetch the URL
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}\${page}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error);
  }

  componentDidMount(){
    const{searchTerm} = this.state;
    this.fetchSearch(searchTerm);
  }
}

const Search = ({value,onChange,onSubmit,children}) => 
    <form onSubmit={onSubmit}>
      {children}
      <input 
        type="text"
        onChange={onChange}
        value={value}
      />
      <button type='submit'>
          {children}
        </button>
    </form>


const Table = ({list,onDismiss}) =>
  <div className='table'>
  {list.map(item => 
    <div key={item.objectID} className='table-row'>
      <span style={largeColumn}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={midColumn}>{item.author}</span>
      <span style={smallColumn}>{item.num_comments}</span>
      <span style={smallColumn}>{item.points}</span>
      <span style={smallColumn}>
        <Button 
          onClick={() => onDismiss(item.objectID)}
          className='button-inline'
        >
          Dismiss
        </Button>
      </span>
    </div>  
  )}
  </div>


const Button = ({onClick,className='',children}) =>
  <button
    type='button'
    className={className}
    onClick={() => onClick()}
  >
    {children}
  </button>

const Loading = () =>
<img src={loading} alt='loading...'/>

export default App;
