import React from 'react';

import { AutoComplete } from 'antd';

import * as api from '../../Client'

import { Cascader, Select } from 'antd';

const {Option} = Select;

export class StructureSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOptions: [],
      selected: [],
      searchDropdown: [],
      searchLoading: false,
    }
  }

  updateDropdown() {
    if (this.props?.structures?.length === 0) {
      return;
    }
    
    const personals = this.props.structures.personal.map((e) => { return {value: e.structureId, label: e.structureName, typeId: e.typeId}});
    const corporation = this.props.structures.corporation.map((e) => { return {value: e.structureId, label: e.structureName, typeId: e.typeId}});
    const alliance = this.props.structures.alliance.map((e) => { return {value: e.structureId, label: e.structureName, typeId: e.typeId}});
    const dropdownOptions = [];
    if (personals?.length) {
      dropdownOptions.push({
        value: 'personal',
        label: 'Personal',
        children: personals
      })
    }
    if (corporation?.length) {
      dropdownOptions.push({
        value: 'corporation',
        label: 'Corporation',
        children: corporation
      })
    }
    if (alliance?.length) {
      dropdownOptions.push({
        value: 'alliance',
        label: 'Alliance',
        children: alliance
      })
    }
    this.setState({
        dropdownOptions
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.structures !== this.props.structures && this.state.dropdownOptions.length === 0 && this.props.structures) {
      this.updateDropdown();
    }
  }

  handleSearch(structureId) {
    const structure = this.state.searchDropdown.filter((s) => s.structureId === structureId)[0];  
    this.props.onStructureChange(structure);
  }

  handlePick(key, structureId) {
    const optionsForKey = this.state.dropdownOptions.filter((group) => group.value === key)[0].children;
    const structure = optionsForKey.filter((s) => s.value === structureId)[0];
    
    this.props.onStructureChange({
      structureId: structure.value,
      structureName: structure.label,
      typeId: structure.typeId,
    });
  }

  // eslint-disable-next-line no-unused-expressions
  debounce(a,b,c){var d,e;return function(){function h(){d=null,c||(e=a.apply(f,g))}var f=this,g=arguments;return clearTimeout(d),d=setTimeout(h,b),c&&!d&&(e=a.apply(f,g)),e}};

  search = this.debounce(searchTerm => {
    if (searchTerm?.length > 5) {
      this.setState({
        searchLoading: true,
        searchTermTooShort: false,
      });
      api.searchStation(searchTerm)
          .then((searchDropdown) => {
            if (searchDropdown) {
              this.setState({searchDropdown, searchLoading: false});
            } else {
              this.setState({searchLoading: false});
            }
          });
    } else {
      this.setState({
        searchLoading: false,
        searchDropdown: [],
        searchTermTooShort: true
      });
    }
  }, 200);

  displayRender = (labels, selectedOptions) =>
    labels.map((label, i) => {
      const option = selectedOptions[i];
      if (i === labels.length - 1) {
        return (
          <span key={option.value}>
            {option.label}
          </span>
        );
      }
      return <span key={option.value}>{label} / </span>;
    });

    shortStationNameNotice() {
      if (this.state.searchTermTooShort) {
        return <><span style={{color: 'red'}}>Enter at least 6 letters. You must have access to the structure.</span><hr/></>;
      } else {
        return <></>;
      }
    }

    searchingText() {
      if (this.state.searchLoading && this.state.searchDropdown.length === 0) {
        return <><span>Searching ...</span><hr/></>;
      }
    }

    render() {
      return (
        <>
          <div style={{
              width: '80%',
              marginLeft: '10%'
            }}>
          <p>Search a market by its name.</p>
          <AutoComplete
            style={{
              marginBottom: '10px',
              width: '100%',
            }}
            onSelect={(key, value) => this.handleSearch(+value.key)}
            onSearch={this.search}
            placeholder="Please enter a station name"
            loading={this.state.searchLoading}
            data-cy="station-search-input"
          >
            {this.state.searchDropdown.map((structure) => (
              <Option key={structure.structureId} value={structure.structureName} data-cy={`station-search-option-${structure.structureId}`}>
                <img src={`https://images.evetech.net/types/${structure.typeId}/icon?size=32`} alt={structure.structureName} /> {structure.structureName}
              </Option>
            ))}
          </AutoComplete>
          {this.searchingText()}
          {this.shortStationNameNotice()}
          <p>Select a market where you or your peers have existing watches.</p>
          <Cascader
            style={{width: '100%',}}
            options={this.state.dropdownOptions}
            displayRender={this.displayRender}
            onChange={(e) => this.handlePick(e[0],+e[1])}
            placeholder="Please select a market from the dropdown"
            data-cy="station-select-cascader"
          />
          </div>
        </>
      );
      }
};