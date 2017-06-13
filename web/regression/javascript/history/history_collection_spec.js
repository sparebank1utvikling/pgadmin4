/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2017, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import HistoryCollection from '../../../pgadmin/static/js/history/history_collection';

describe('historyCollection', function () {
  let historyCollection, historyModel, onChangeSpy;
  beforeEach(() => {
    historyModel = [{some: 'thing', someOther: ['array element']}];
    historyCollection = new HistoryCollection(historyModel);
    onChangeSpy = jasmine.createSpy('onChangeHandler');

    historyCollection.onChange(onChangeSpy);
  });

  describe('length', function () {
    it('returns 0 when underlying history model has no elements', function () {
      historyCollection = new HistoryCollection([]);

      expect(historyCollection.length()).toBe(0);
    });

    it('returns the length of the underlying history model', function () {
      expect(historyCollection.length()).toBe(1);
    });
  });

  describe('add', function () {
    let expectedHistory;
    beforeEach(() => {
      historyCollection.add({some: 'new thing', someOther: ['value1', 'value2']});

      expectedHistory = [
        {some: 'thing', someOther: ['array element']},
        {some: 'new thing', someOther: ['value1', 'value2']},
      ];
    });

    it('adds a passed entry', function () {
      expect(historyCollection.historyList).toEqual(expectedHistory);
    });

    it('calls the onChange function', function () {
      expect(onChangeSpy).toHaveBeenCalledWith(expectedHistory);
    });
  });

  describe('reset', function () {
    beforeEach(() => {
      historyCollection.reset();
    });

    it('drops the history', function () {
      expect(historyCollection.historyList).toEqual([]);
      expect(historyCollection.length()).toBe(0);
    });

    it('calls the onChange function', function () {
      expect(onChangeSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('sort', function () {
    it('doesn\'t sort');
  });

  describe('when instantiated', function () {
    describe('from a history model', function () {
      it('has the historyModel', () => {
        let content = historyCollection.historyList;

        expect(content).toEqual(historyModel);
      });

    });
  });
});