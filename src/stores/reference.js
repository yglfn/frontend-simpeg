import { defineStore } from 'pinia';
import api from '@/services/api';

export const useReferenceStore = defineStore('reference', {
    state: () => ({
        religions: [],
        educations: [],
        maritalStatuses: [],
        bloodTypes: [],
        positionTypes: [],
        groups: [],
        ranks: [],
        provinces: [],
        regencies: [], // Cached or fetched on demand
        districts: [],
        villages: [],
    }),

    actions: {
        async fetchCommonReferences() {
            try {
                const [
                    religionsRes,
                    educationsRes,
                    maritalRes,
                    bloodRes,
                    posTypesRes,
                    groupsRes,
                    ranksRes,
                    provincesRes
                ] = await Promise.all([
                    api.get('/references/religions'),
                    api.get('/references/educations'),
                    api.get('/references/marital-statuses'),
                    api.get('/references/blood-types'),
                    api.get('/references/position-types'),
                    api.get('/references/groups'),
                    api.get('/references/ranks'),
                    api.get('/references/provinces'),
                ]);

                this.religions = religionsRes.data.data;
                this.educations = educationsRes.data.data;
                this.maritalStatuses = maritalRes.data.data;
                this.bloodTypes = bloodRes.data.data;
                this.positionTypes = posTypesRes.data.data;
                this.groups = groupsRes.data.data;
                this.ranks = ranksRes.data.data;
                this.provinces = provincesRes.data.data;
            } catch (error) {
                console.error('Failed to fetch common references', error);
            }
        },

        async fetchRegencies(provinceId) {
            if (!provinceId) {
                this.regencies = [];
                return;
            }
            try {
                const response = await api.get(`/references/regencies?province_id=${provinceId}`);
                this.regencies = response.data.data;
                return this.regencies;
            } catch (error) {
                console.error('Failed to fetch regencies', error);
                return [];
            }
        },

        async fetchDistricts(regencyId) {
            if (!regencyId) {
                this.districts = [];
                return;
            }
            try {
                const response = await api.get(`/references/districts?regency_id=${regencyId}`);
                this.districts = response.data.data;
                return this.districts;
            } catch (error) {
                console.error('Failed to fetch districts', error);
                return [];
            }
        },

        async fetchVillages(districtId) {
            if (!districtId) {
                this.villages = [];
                return;
            }
            try {
                const response = await api.get(`/references/villages?district_id=${districtId}`);
                this.villages = response.data.data;
                return this.villages;
            } catch (error) {
                console.error('Failed to fetch villages', error);
                return [];
            }
        }
    }
});
