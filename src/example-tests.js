/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import request from 'request-promise';

export default function (idProp = 'id', url = 'http://localhost:3030/todos') {
  let firstId;

  it('POST', function () {
    this.slow(200);
    let body = { [idProp]: 1, text: 'first todo', complete: false };

    return request.post({ url, json: true, body })
      .then(todo => {
        let body = { [idProp]: 2, text: 'second todo', complete: false };

        firstId = todo[idProp];
        expect(todo[idProp]).to.exist;
        expect(todo.text).to.equal('first todo');

        return request.post({ url, json: true, body });
      })
      .then(todo => {
        let body = { [idProp]: 3, text: 'third todo', complete: false };

        expect(todo.text).to.equal('second todo');

        return request.post({ url, json: true, body });
      })
      .then(todo => expect(todo.text).to.equal('third todo'));
  });

  describe('GET /', () => {
    it('GET / with default pagination', () => {
      return request({
        url,
        json: true
      }).then(page => {
        expect(page.total).to.equal(3);
        expect(page.limit).to.equal(2);
        expect(page.data.length).to.equal(2);
      });
    });

    it('GET / with filter', () => {
      return request({
        url,
        json: true,
        qs: { text: 'second todo' }
      }).then(page => {
        expect(page.total).to.equal(1);
        expect(page.limit).to.equal(2);
        expect(page.data.length).to.equal(1);
        expect(page.data[0].text).to.equal('second todo');
      });
    });
  });

  it('GET /id', () => {
    return request({ url: `${url}/${firstId}`, json: true })
      .then(todo => {
        expect(todo[idProp]).to.equal(firstId);
        expect(todo.text).to.equal('first todo');
      });
  });

  it('PATCH', () => {
    return request.patch({
      url: `${url}/${firstId}`,
      json: true,
      body: { complete: true }
    }).then(todo => {
      expect(todo[idProp]).to.equal(firstId);
      expect(todo.text).to.equal('first todo');
      expect(todo.complete).to.be.ok;
    });
  });

  it('DELETE /id', () => {
    return request.post({
      url,
      json: true,
      body: { [idProp]: 4, text: 'to delete', complete: false }
    }).then(todo =>
      request.del({ url: `${url}/${todo[idProp]}`, json: true })
        .then(todo => expect(todo.text).to.equal('to delete'))
    );
  });
}
