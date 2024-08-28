<script setup>
import AnalyticsCongratulations from '@/views/pages/dashboard/AnalyticsCongratulations.vue'
import StatisticsDefect from "@/views/pages/dashboard/StatisticsDefect.vue";
import Map from "@/views/pages/dashboard/Map.vue";


// 👉 Images
</script>

<template>
  <VRow>
    <!-- 👉 Congratulations -->
    <VCol
      cols="12"
      md="12"
    >
      <AnalyticsCongratulations/>
    </VCol>
    <!--    <VCol
      cols="12"
      sm="4"
    >
      <VRow>
        &lt;!&ndash; 👉 Profit &ndash;&gt;
        <VCol
          cols="12"
          md="6"
        >
          <CardStatisticsVertical
            v-bind="{
              title: 'Profit',
              image: chart,
              stats: '$12,628',
              change: 72.80,
            }"
          />
        </VCol>

        &lt;!&ndash; 👉 Sales &ndash;&gt;
        <VCol
          cols="12"
          md="6"
        >
          <CardStatisticsVertical
            v-bind="{
              title: 'Sales',
              image: wallet,
              stats: '$4,679',
              change: 28.42,
            }"
          />
        </VCol>
      </VRow>
    </VCol>-->

    <!--    Statistics   -->
    <VCol
      cols="12"
      md="12"
    >
      <StatisticsDefect/>
    </VCol>

    <!--    Map  -->
    <VCol
      cols="12"
      md="12"
      class="map-column"
    >
      <Map/>
    </VCol>



    <!--    &lt;!&ndash; 👉 Total Revenue &ndash;&gt;
        <VCol
          cols="12"
          md="8"
          order="2"
          order-md="1"
        >
          <AnalyticsTotalRevenue/>
        </VCol>

        <VCol
          cols="12"
          md="4"
          order="1"
          order-md="2"
          sm="8"
        >
          <VRow>
            &lt;!&ndash; 👉 Payments &ndash;&gt;
            <VCol
              cols="12"
              sm="6"
            >
              <CardStatisticsVertical
                v-bind=" {
                  title: 'Payments',
                  image: paypal,
                  stats: '$2,468',
                  change: -14.82,
                }"
              />
            </VCol>

            &lt;!&ndash; 👉 Revenue &ndash;&gt;
            <VCol
              cols="12"
              sm="6"
            >
              <CardStatisticsVertical
                v-bind="{
                  title: 'Transactions',
                  image: card,
                  stats: '$14,857',
                  change: 28.14,
                }"
              />
            </VCol>
          </VRow>

          <VRow>
            &lt;!&ndash; 👉 Profit Report &ndash;&gt;
            <VCol
              cols="12"
              sm="12"
            >
              <AnalyticsProfitReport/>
            </VCol>
          </VRow>
        </VCol>

        &lt;!&ndash; 👉 Order Statistics &ndash;&gt;
        <VCol
          cols="12"
          md="4"
          order="3"
          sm="6"
        >
          <AnalyticsOrderStatistics/>
        </VCol>

        &lt;!&ndash; 👉 Tabs chart &ndash;&gt;
        <VCol
          cols="12"
          md="4"
          order="3"
          sm="6"
        >
          <AnalyticsFinanceTabs/>
        </VCol>

        &lt;!&ndash; 👉 Transactions &ndash;&gt;
        <VCol
          cols="12"
          md="4"
          order="3"
          sm="6"
        >
          <AnalyticsTransactions/>
        </VCol>-->

  </VRow>
</template>

<style scoped>
.map-column {
  height: 600px;
}
</style>
