import React from 'react';

import { Timeline } from 'antd';

export default class Development extends React.Component {

  render() {

    return (
      <>
      <h2>Development</h2>
      <p>This page gives you an overview of past and upcoming developments. <a href="https://discord.gg/bTCdjBF" target="_blank" rel="noopener noreferrer">Join our Discord</a> for discussions and feature requests.</p>
      <Timeline mode='left'>
        <Timeline.Item label="upcoming" color="gray">Keep filter state on refresh</Timeline.Item>
        <Timeline.Item label="upcoming" color="gray">Export to Excel</Timeline.Item>
        <Timeline.Item label="upcoming" color="gray">Shopping Lists</Timeline.Item>
        <Timeline.Item label="upcoming" color="gray">Import for a target persona</Timeline.Item>
        <Timeline.Item label="development" color="blue">Folders</Timeline.Item>
        <Timeline.Item label="2020-11-01" color="green">Include all triggered watches in mails</Timeline.Item>
        <Timeline.Item label="2020-10-19" color="green">Improved handling of expired logins</Timeline.Item>
        <Timeline.Item label="2020-09-02" color="green">Improved Server Infrastructure to reduce cost</Timeline.Item>
        <Timeline.Item label="2020-07-01" color="green">Highlight items which are overpriced</Timeline.Item>
        <Timeline.Item label="2020-06-19" color="green">EVE Marketwatch V3 Launch</Timeline.Item>
        <Timeline.Item label="2019-06-21" color="green">EVE Marketwatch V2 Launch</Timeline.Item>
        <Timeline.Item label="2018-12-08" color="green">EVE Marketwatch V1 Launch</Timeline.Item>
      </Timeline>
      </>
    );
  }
}