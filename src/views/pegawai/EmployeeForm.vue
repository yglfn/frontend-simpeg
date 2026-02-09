<template>
  <div>
    <h1 class="text-2xl font-semibold text-slate-800 mb-6">{{ isEdit ? 'Edit Pegawai' : 'Tambah Pegawai Baru' }}</h1>

    <div class="bg-white shadow rounded-lg p-6 border border-slate-100">
      <form @submit.prevent="submitForm" class="space-y-6">
        
        <!-- Tabs / Sections -->
        <div>
          <h2 class="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Informasi Pribadi</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <input v-model="form.name" type="text" required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">NIP</label>
              <input v-model="form.nip" type="text" required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Email</label>
              <input v-model="form.email" type="email" required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">NO HP</label>
              <input v-model="form.phone_number" type="text" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
            </div>
          </div>
        </div>

        <div>
           <h2 class="text-lg font-medium text-slate-900 border-b pb-2 mb-4 mt-6">Alamat Domisili</h2>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <!-- Province -->
             <div>
               <label class="block text-sm font-medium text-slate-700">Provinsi</label>
               <select v-model="address.province_id" @change="handleProvinceChange" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                 <option value="">Pilih Provinsi</option>
                 <option v-for="prov in referenceStore.provinces" :key="prov.id" :value="prov.id">
                   {{ prov.province_name }}
                 </option>
               </select>
             </div>

             <!-- Regency -->
             <div>
               <label class="block text-sm font-medium text-slate-700">Kabupaten/Kota</label>
               <select v-model="address.regency_id" @change="handleRegencyChange" :disabled="!address.province_id" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-slate-50 disabled:bg-slate-100">
                 <option value="">Pilih Kabupaten/Kota</option>
                 <option v-for="reg in regencies" :key="reg.id" :value="reg.id">
                   {{ reg.regency_name }}
                 </option>
               </select>
             </div>

             <!-- District -->
             <div>
               <label class="block text-sm font-medium text-slate-700">Kecamatan</label>
               <select v-model="address.district_id" @change="handleDistrictChange" :disabled="!address.regency_id" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-slate-50 disabled:bg-slate-100">
                 <option value="">Pilih Kecamatan</option>
                 <option v-for="dist in districts" :key="dist.id" :value="dist.id">
                   {{ dist.district_name }}
                 </option>
               </select>
             </div>

             <!-- Village -->
             <div>
               <label class="block text-sm font-medium text-slate-700">Kelurahan/Desa</label>
               <select v-model="address.village_id" :disabled="!address.district_id" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-slate-50 disabled:bg-slate-100">
                 <option value="">Pilih Kelurahan/Desa</option>
                 <option v-for="vil in villages" :key="vil.id" :value="vil.id">
                   {{ vil.village_name }}
                 </option>
               </select>
             </div>

             <div class="col-span-2">
               <label class="block text-sm font-medium text-slate-700">Alamat Lengkap (Jalan, RT/RW)</label>
               <textarea v-model="address.full_address" rows="3" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"></textarea>
             </div>
           </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button type="button" @click="$router.back()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Simpan Pegawai
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useReferenceStore } from '@/stores/reference';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const referenceStore = useReferenceStore();

const isEdit = ref(false);
const form = reactive({
  name: '',
  nip: '',
  email: '',
  phone_number: '',
});

const address = reactive({
  province_id: '',
  regency_id: '',
  district_id: '',
  village_id: '',
  full_address: ''
});

// Local state for cascading options since store action returns them
const regencies = ref([]);
const districts = ref([]);
const villages = ref([]);

onMounted(async () => {
  await referenceStore.fetchCommonReferences();
});

const handleProvinceChange = async () => {
  address.regency_id = '';
  address.district_id = '';
  address.village_id = '';
  regencies.value = [];
  districts.value = [];
  villages.value = [];
  
  if (address.province_id) {
    regencies.value = await referenceStore.fetchRegencies(address.province_id);
  }
};

const handleRegencyChange = async () => {
  address.district_id = '';
  address.village_id = '';
  districts.value = [];
  villages.value = [];

  if (address.regency_id) {
    districts.value = await referenceStore.fetchDistricts(address.regency_id);
  }
};

const handleDistrictChange = async () => {
  address.village_id = '';
  villages.value = [];

  if (address.district_id) {
    villages.value = await referenceStore.fetchVillages(address.district_id);
  }
};

const submitForm = async () => {
  // Simple check
  if (!form.name || !form.nip || !form.email) {
      alert("Mohon lengkapi data wajib.");
      return;
  }
  
  try {
      const payload = {
          ...form,
          // Combine address into payload as expected by backend (Assuming backend handles nested or separate structure, 
          // usually we send it as part of profiles or addresses)
          // For now, let's assume we just log it or send basic fields.
          // Adjust payload structure based on exact Backend API requirement.
          address: { ...address } 
      };
      
      console.log("Submitting:", payload);
      // await api.post('/employees', payload);
      alert("Simulasi Simpan Berhasil");
      router.push('/employees');
  } catch (error) {
      console.error("Failed to save", error);
      alert("Gagal menyimpan data.");
  }
};
</script>
