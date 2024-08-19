<script setup>
import {onMounted, ref} from 'vue'
import axios from 'axios'
import VueApexCharts from 'vue3-apexcharts'
import {API_ENDPOINTS, Statistics_ENDPOINTS} from '@/assets/config/api/api_endPoints.js';

const allStatistics = ref([])
const allData = ref([])
const allDataArray = ref([])
const allStatisticsArray = ref([])

const getAllStatistics = async () => {
  const res = await axios.post(`${Statistics_ENDPOINTS}/get-all-statistics`)
  allStatistics.value = res.data.data
  // console.log('Fetched data:', allStatistics.value); // Check fetched data
  processStatisticsData(allStatistics.value);
}
const getAllData = async () => {
  const res = await axios.get(`${API_ENDPOINTS}/get_alldata`);
  allData.value = res.data.data
  // console.log(allData.value)
}
function processStatisticsData(statisticsData) {
  // console.log('Processing data:', statisticsData);
  let processedData = [];

  statisticsData.forEach(item => {
    let date = new Date(item.date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // getMonth() returns a zero-based value (where 0 indicates the first month)
    let day = date.getDate();

    processedData.push({
      year: year,
      month: month,
      day: day,
      defectCount: item.defectCount,
      activateCount: item.activateCount,
      deactivateCount: item.deactivateCount
    });
  });

  allStatisticsArray.value = processedData;
  // console.log('Processed data:', allStatisticsArray.value);
}

onMounted(async() => {
  console.log('mounted')
  await getAllStatistics()
  await getAllData()
  updateMonthSeries(2024)
})

const monthSeries = ref([
  {
      name: 'Defect Detected',
      data: [0]
    },
    {
      name: 'Activated Machine',
      data: [0]
    },
    {
      name: 'Deactivated Machine',
      data: [0]
    },
    {
      name: 'Defect Unmanaged',
      data: [0]
    }
])
function updateMonthSeries(year) {
  // Initialize an array with 12 zeros (for each month)
  let defectDetected = new Array(12).fill(0);
  let activatedMachine = new Array(12).fill(0);
  let deactivatedMachine = new Array(12).fill(0);
  let defectUnmanaged = new Array(12).fill(0);

  console.log('Initial counts:', defectDetected, activatedMachine, deactivatedMachine, defectUnmanaged); // Check initial counts

  // Iterate over allStatisticsArray.value
  allStatisticsArray.value.forEach(item => {
    if(item.year === year){
      // The month in the date is 0-indexed, so we subtract 1
      let monthIndex = item.month - 1;

      console.log('Processing item:', item); // Check the item being processed

      // Update the counts for each category
      defectDetected[monthIndex] += item.defectCount;
      activatedMachine[monthIndex] += item.activateCount;
      deactivatedMachine[monthIndex] += item.deactivateCount;
      // Assuming defectUnmanaged is calculated somehow, update it as well
      defectUnmanaged[monthIndex] += item.defectCount-(item.activateCount+item.deactivateCount);
    }
  });

  console.log('Updated counts:', defectDetected, activatedMachine, deactivatedMachine, defectUnmanaged); // Check updated counts

  // Update monthSeries with the new data
  monthSeries.value = [
    {
      name: 'Defect Detected',
      data: defectDetected
    },
    {
      name: 'Activated Machine',
      data: activatedMachine
    },
    {
      name: 'Deactivated Machine',
      data: deactivatedMachine
    },
    {
      name: 'Defect Unmanaged',
      data: defectUnmanaged
    }
  ];
}
const chartOptions = computed(() => {
  return {
    day: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          stacked: true,
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
      },
      yaxis: {
        title: {
          text: 'Times'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$ " + val + " thousands"
          }
        }
      }
    },
    month: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          stacked: true,
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      yaxis: {
        title: {
          text: 'Times'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " Times"
          }
        }
      }
    }


  }
})

</script>

<template>
  <VCard>
    <VRow no-gutters>
      <VCol>
        <VCardTitle class="mb-0">Statistics</VCardTitle>
        <VueApexCharts :options="chartOptions.month" :series="monthSeries" :height="400" type="bar"/>
      </Vcol>
    </VRow>
  </VCard>
</template>

<style lang="scss" scoped>

</style>
