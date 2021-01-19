
import * as qs from "query-string";
import { API } from './Constants';
import { getToken, clearToken } from './Authenticator';

function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${getToken()}`
      };
}

export async function getWatches(structureId, params) {
    return await fetch(
        `${API}/v2/watches/location/${structureId}?${qs.stringify({...params})}`,
        {
        headers: getAuthHeaders()
      }).then(handleResponse);
}

export async function putWatch(watch) {
    return await fetch(
        `${API}/watches`,
        {
            method: 'put',
            body: JSON.stringify(watch),
        headers: getAuthHeaders()
      }).then(handleResponse);
}

export async function deleteWatch(watch) {
    return await fetch(
        `${API}/owner/${watch.ownerId}/location/${watch.locationId}/watches/type/${watch.typeId}`,
        {
            method: 'delete',
        headers: getAuthHeaders()
      }).then(handleResponse);
}

async function handleResponse(response) {
    if (response.status === 401) {
        clearToken();
        window.location.replace('/');
        return null;
    } else if (response.status >= 400) {
        throw Error('Request failed', response);
    } else {
        try {
            return await response.json();
        } catch (err) {
            // intended, e.g. for requests that don't return data
            // todo: don't return json headers on delete and use proper response mapping
            console.log(err);
            return null;
        }
    }
}

export async function getStructures() {
    return await fetch(
          `${API}/structures`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse);
}

export async function getCorporationMaintainers(corporationId) {
    return await fetch(
          `${API}/corporation/${corporationId}/maintainers`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function getAllianceMaintainers(allianceId) {
    return await fetch(
          `${API}/alliance/${allianceId}/maintainers`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function getCorporationMembers(corporationId) {
    return await fetch(
          `${API}/corporation/${corporationId}/members`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function getAllianceMembers(allianceId) {
    return await fetch(
          `${API}/alliance/${allianceId}/members`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function putImport(id) {
    return await fetch(
          `${API}/import`,
          {
            method: 'put',
            body: JSON.stringify({id}),
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function putExport(requestInfo) {
    return await fetch(
          `${API}/export`,
          {
            method: 'post',
            body: JSON.stringify(requestInfo),
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function getCharacterSettings(characterId) {
    return await fetch(
          `${API}/character/${characterId}/settings`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function searchType(searchTerm) {
    return await fetch(
          `${API}/search?term=${searchTerm}&category=inventory_type`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function searchStation(searchTerm) {
    return await fetch(
          `${API}/search?term=${searchTerm}&category=station`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function getSnapshots(structureId, typeId, isBuy, queryParams = {}) {
    return await fetch(
          `${API}/location/${structureId}/type_id/${typeId}/order_type/${isBuy ? 'buy' : 'sell'}/snapshots?${qs.stringify(queryParams)}`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function getDaysRemaining(structureId, typeId, isBuy) {
    return await fetch(
          `${API}/location/${structureId}/type_id/${typeId}/order_type/${isBuy ? 'buy' : 'sell'}/days_remaining`,
          {
            headers: getAuthHeaders()
        }).then(handleResponse)
}

export async function putMaintainers(groupType, groupId, maintainerIds) {
    return await fetch(
        `${API}/${groupType}/${groupId}/maintainers`,
        {
          method: 'put',
          body: JSON.stringify(maintainerIds),
          headers: getAuthHeaders()
      }).then(handleResponse)
}

export async function putSettings(settings, characterId) {
    return await fetch(
        `${API}/character/${characterId}/settings`,
        {
          method: 'put',
          body: JSON.stringify(settings),
          headers: getAuthHeaders()
      }).then(handleResponse)
}

export async function login(code) {
    return await fetch(
        `${API}/login`,
        {
          method: 'post',
          body: JSON.stringify({code}),
          headers: getAuthHeaders()
      }).then(handleResponse)
}