<script setup>
import {onMounted, ref, watch, computed} from 'vue';
import axios from 'axios';
import {API_ENDPOINTS} from "@/assets/config/api/api_endPoints";
import LottieAnimation from "@/assets/lottie/lottieanimetion.vue";
import WebSocketService from '@/assets/config/websocket/websocket.js';
import {Websocket_URL_Frontend} from '@/assets/config/api/websocket_endPoints.js';
import { VDateInput } from 'vuetify/labs/VDateInput'

let socketService = null;

// data
const data = ref([]);
let allData = ref([]); // A reference to hold all the data
const imageData = ref([]);
const selectedImage = ref(null);
const showModal = ref(false);
const dataIsEmpty = computed(() => data.value.length === 0);

// filter
const thisYear = new Date().getFullYear();
const years = ref(Array.from({length: 10}, (_, i) => thisYear - i));
const todayFilter = ref(false);
const fromDate = ref(null);
const toDate = ref(new Date());

const yearFilter = ref([]);
const monthFilter = ref([]);
const dayFilter = ref([]);
const managedFilter = ref(false);
const notManagedFilter = ref(false);

// pagination
const page = ref(1);
const limit = ref(2);
const totalPages = ref(0);

onMounted(async () => {
  await getAlldata();

  socketService = new WebSocketService(Websocket_URL_Frontend);
  socketService.onMessage((event) => {
    const data = JSON.parse(event.data);
    if (data.id) {
      getAlldata();
    }
  });
});

const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getAlldata = async () => {
  const response = await axios.get(`${API_ENDPOINTS}/get_alldata`);
  allData.value = response.data.data.reverse(); // Store the fetched data in allData
  console.log(allData.value);
  applyFilters(); // Apply the filters to the fetched data
};

const ClearALLfilter = () => {
  todayFilter.value = false;
  yearFilter.value = [];
  monthFilter.value = [];
  dayFilter.value = [];
  managedFilter.value = false;
  notManagedFilter.value = false;
  getAlldata(); // Fetch and display all data after clearing the filters
};

const applyFilters = () => {
  let filteredData = [...allData.value]; // Start with all the data

  // If the today filter is active, filter the data to only include items from today
  if (todayFilter.value) {
    const today = new Date();
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear();
    });
  }

  // If fromDate is set, filter the data to only include items from the fromDate onwards
  if (fromDate.value) {
    const from = new Date(fromDate.value);
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= from;
    });
  }

  // If toDate is set, filter the data to only include items up to the toDate
  if (toDate.value) {
    const to = new Date(toDate.value);
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate <= to;
    });
  }

  // If the managed filter is active, filter the data to only include managed items
  if (managedFilter.value) {
    filteredData = filteredData.filter(item => item.ismanaged);
  }

  if (notManagedFilter.value) {
    filteredData = filteredData.filter(item => !item.ismanaged);
  }

  // Calculate the total number of pages based on the filtered data
  totalPages.value = Math.ceil(filteredData.length / limit.value);
  // Calculate the start and end indices for the current page
  const start = (page.value - 1) * limit.value;
  const end = page.value * limit.value;
  // Slice the filtered data to only include the items for the current page
  data.value = filteredData.slice(start, end);
  // Map the data to only include the image data
  imageData.value = data.value.map(item => item.image);
};

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
    getAlldata();
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    getAlldata();
  }
};

const getPageNumbers = () => {
  const pageNumbers = [];
  let start = Math.max(1, page.value - 4);
  let end = Math.min(totalPages.value, start + 9);
  if (page.value < 6) {
    end = Math.min(totalPages.value, 10);
  } else {
    start = Math.max(1, end - 9);
  }
  for (let i = start; i <= end; i++) {
    pageNumbers.push(i);
  }
  return pageNumbers;
};

const goToPage = (pageNumber) => {
  page.value = pageNumber;
  getAlldata();
};

const openModal = (index) => {
  selectedImage.value = imageData.value[index];
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

watch([todayFilter, yearFilter, monthFilter, dayFilter, managedFilter, notManagedFilter, limit, toDate, fromDate], applyFilters);
</script>


<template>
  <VDialog v-model="showModal" max-width="500px">
    <VCard>
      <v-card-title>Image</v-card-title>
      <v-img :src="`data:image/jpeg;base64,${selectedImage}`" height="auto"></v-img>
      <VBtn @click="closeModal">Close</VBtn>
    </VCard>
  </VDialog>
  <VRow>
    <VCol cols="10" sm="9">
      <VCard>
        <VCardTitle class="text-center d-flex justify-center align-items-center">
          <VIcon class="mr-1 pt-2 pb-0" size="50">mdi-history</VIcon>
          <h1>History</h1>
        </VCardTitle>

        <div v-if="!dataIsEmpty">
          <VRow>
            <VCol cols="12">
              <div v-for="(item, index) in data">
                <VCard style="margin: 10px 2rem;">
                  <VRow>
                    <VCol cols="4" lg="3">
                      <v-img
                        :alt="`${index}`"
                        :src="`data:image/jpeg;base64,${item.image}`"
                        class="responsive-img"
                        max-height="200"
                        @click="() => openModal(index)"
                      ></v-img>
                    </VCol>
                    <VCol cols="7">
                      <VCardTitle>
                        ID : {{ item.id }}
                      </VCardTitle>
                      <VCardText>
                        <p>
                          Date : {{ formatDate(item.timestamp) }}
                        </p>
                        <p>
                          Time : {{ new Date(item.timestamp).toLocaleTimeString() }}
                        </p>
                        <p>
                          <div v-if="item.ismanaged">
                            Managed by : {{
                              item.userDocument && item.userDocument.firstname ? item.userDocument.firstname : item.userDocument && item.userDocument.username ? item.userDocument.username + "(username)" : ''
                            }}
                            <VChip
                              label
                              size="small"
                              :color="item.status === 'Activated' ? '#3EFF00' : '#FFA900'">
                              {{ item.status }}
                            </VChip>
                          </div>
                          <div v-else>
                            <VChip
                              label
                              size="small"
                              :color="'#FF3333'">
                              Not Managed
                            </VChip>
                          </div>
                        </p>
                      </VCardText>
                    </VCol>
                  </VRow>
                </VCard>
              </div>
            </VCol>
          </VRow>
          <div class="d-flex justify-end ma-3">
            <div class="w-25">
              <VSelect
                v-model="limit"
                :items="[2, 5, 10, 20]"
                class="ml-auto"
                dense
                label="Items per page"
                small
              ></VSelect>
            </div>
          </div>
        </div>
        <div v-else class="justify-center align-content-center d-flex">
          <LottieAnimation class="justify-center align-content-center text-center align-center d-inline-flex"
                           animationPath="src/assets/lottie/lottieFile/noData.json" width="300px"
                           height="350px"/>
        </div>
      </VCard>

      <div class="d-flex justify-space-between mt-3">
        <div>
          <VBtn :disabled="page === 1" @click="prevPage">Previous</VBtn>
        </div>
        <div class="d-flex">
          <div v-for="pageNumber in getPageNumbers()" :key="pageNumber">
            <VBtn :disabled="page === pageNumber" class="mr-1 overflow-auto"
                  rounded-lg @click="() => { goToPage(pageNumber) }">
              {{ pageNumber }}
            </VBtn>
          </div>
        </div>
        <div>
          <VBtn :disabled="page === totalPages" @click="nextPage">Next</VBtn>
        </div>
      </div>
      <div class="text-center">
        <p>Page: {{ page }} / {{ totalPages }}</p>
      </div>
    </VCol>
    <VCol cols="2" sm="3">
      <VCard>
        <VCardTitle class="d-flex justify-space-between">
          <h2>Filter</h2>
          <VBtn icon @click="ClearALLfilter">
            <VIcon>mdi-filter-remove</VIcon>
          </VBtn>
        </VCardTitle>
        <VCardText>
          <h4>
            Time filter
            <hr>
          </h4>
          <VCheckbox id="today_filter" v-model="todayFilter" class="my-2 mx-2" label="To Day" @click=""/>
          <v-select v-model="yearFilter" :disabled="todayFilter" :items="years"
                    chips
                    class="my-2"
                    clearable
                    label="Years"
                    multiple
                    variant="solo-filled"
          ></v-select>
          <v-select v-model="monthFilter" :disabled="todayFilter"
                    :items="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']"
                    chips
                    class="my-2"
                    clearable
                    label="Months"
                    multiple
                    variant="solo-filled"
          ></v-select>
          <v-select v-model="dayFilter" :disabled="todayFilter"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]"
                    chips
                    class="my-2"
                    clearable
                    label="Days"
                    multiple
                    variant="solo-filled"
          ></v-select>
          <VDateInput
            v-model="fromDate"
            label="From Date"
            class="my-2"
            clearable
            prepend-icon=""
            append-inner-icon="mdi-calendar"
          ></VDateInput>
          <VDateInput
            v-model="toDate"
            label="To Date"
            class="my-2"
            clearable
            prepend-icon=""
            append-inner-icon="mdi-calendar"
            viewMode="month"
          ></VDateInput>
        </VCardText>
        <VCardText>
          <h4 class="mb-2">
            Other filter
            <hr>
          </h4>
          <VCheckbox v-model="managedFilter" class="ml-2" label="Managed" @click="notManagedFilter = false"/>
          <VCheckbox v-model="notManagedFilter" class="ml-2" label="Not Managed" @click="managedFilter = false"/>
        </VCardText>
        <div class="d-flex justify-center mb-2">
          <VBtn @click="">Filter</VBtn>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>


<style lang="scss" scoped>

</style>
