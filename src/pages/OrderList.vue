<script setup>
import {ref} from 'vue'
import axios from "axios";

const OrderList = ref([
    {
        id: 1,
        name: 'John Doe',
        phone: '0812345678',
        address: '150 Sri Chant Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'ติดต่อก่อนจัดส่ง',
        productList: [
            {
                id: 1,
                name: 'Product 1',
                quantity: 2
            },
            {
                id: 2,
                name: 'Product 2',
                quantity: 3
            }
        ],
        total: 100,
        payment_channels: 'PromptPay',
        status: 'Paid',
        date: '2021-10-10',
        time: '10:00',
        overdue_Balance: 0,
        distance: 500,
        location: [16.428633277459436, 102.86357577082252]
    },
    {
        id: 2,
        name: 'Jane Smith',
        phone: '0812345679',
        address: '250 Mittraphap Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Leave at the front door',
        productList: [
            {
                id: 3,
                name: 'Product 3',
                quantity: 1
            },
            {
                id: 4,
                name: 'Product 4',
                quantity: 2
            }
        ],
        total: 150,
        payment_channels: 'Credit Card',
        status: 'Pending',
        date: '2021-10-11',
        time: '14:00',
        overdue_Balance: 0,
        distance: 700,
        location: [16.432633277459436, 102.86857577082252]
    },
    {
        id: 3,
        name: 'Alice Johnson',
        phone: '0812345680',
        address: '350 Srichan Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Ring the bell twice',
        productList: [
            {
                id: 5,
                name: 'Product 5',
                quantity: 5
            }
        ],
        total: 250,
        payment_channels: 'Cash on Delivery',
        status: 'Delivered',
        date: '2021-10-12',
        time: '12:00',
        overdue_Balance: 0,
        distance: 600,
        location: [16.437633277459436, 102.87357577082252]
    },
    {
        id: 4,
        name: 'Bob Brown',
        phone: '0812345681',
        address: '450 Ruenrom Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Deliver to the neighbor if not home',
        productList: [
            {
                id: 6,
                name: 'Product 6',
                quantity: 3
            },
            {
                id: 7,
                name: 'Product 7',
                quantity: 1
            }
        ],
        total: 180,
        payment_channels: 'Bank Transfer',
        status: 'Shipped',
        date: '2021-10-13',
        time: '09:00',
        overdue_Balance: 0,
        distance: 550,
        location: [16.442633277459436, 102.87857577082252]
    },
    {
        id: 5,
        name: 'Charlie Davis',
        phone: '0812345682',
        address: '550 Glang Muang Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Call before delivery',
        productList: [
            {
                id: 8,
                name: 'Product 8',
                quantity: 4
            },
            {
                id: 9,
                name: 'Product 9',
                quantity: 2
            }
        ],
        total: 220,
        payment_channels: 'PromptPay',
        status: 'Paid',
        date: '2021-10-14',
        time: '16:00',
        overdue_Balance: 0,
        distance: 800,
        location: [16.447633277459436, 102.88357577082252]
    },
    {
        id: 6,
        name: 'David Evans',
        phone: '0812345683',
        address: '650 Ban Kao Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Leave at the reception',
        productList: [
            {
                id: 10,
                name: 'Product 10',
                quantity: 6
            }
        ],
        total: 300,
        payment_channels: 'Credit Card',
        status: 'Pending',
        date: '2021-10-15',
        time: '10:30',
        overdue_Balance: 0,
        distance: 900,
        location: [16.452633277459436, 102.88857577082252]
    },
    {
        id: 7,
        name: 'Eva White',
        phone: '0812345684',
        address: '750 Kaen Nakhon Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Call when arriving',
        productList: [
            {
                id: 1,
                name: 'Product 1',
                quantity: 2
            },
            {
                id: 4,
                name: 'Product 4',
                quantity: 1
            }
        ],
        total: 130,
        payment_channels: 'Cash on Delivery',
        status: 'Delivered',
        date: '2021-10-16',
        time: '11:00',
        overdue_Balance: 0,
        distance: 650,
        location: [16.457633277459436, 102.89357577082252]
    },
    {
        id: 8,
        name: 'Frank Green',
        phone: '0812345685',
        address: '850 Maliwan Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Ring the bell',
        productList: [
            {
                id: 3,
                name: 'Product 3',
                quantity: 3
            },
            {
                id: 6,
                name: 'Product 6',
                quantity: 2
            }
        ],
        total: 170,
        payment_channels: 'Bank Transfer',
        status: 'Shipped',
        date: '2021-10-17',
        time: '15:00',
        overdue_Balance: 0,
        distance: 700,
        location: [16.462633277459436, 102.89857577082252]
    },
    {
        id: 9,
        name: 'Grace Harris',
        phone: '0812345686',
        address: '950 Sila Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Leave at the gate',
        productList: [
            {
                id: 5,
                name: 'Product 5',
                quantity: 4
            },
            {
                id: 7,
                name: 'Product 7',
                quantity: 1
            }
        ],
        total: 200,
        payment_channels: 'PromptPay',
        status: 'Paid',
        date: '2021-10-18',
        time: '13:00',
        overdue_Balance: 0,
        distance: 750,
        location: [16.467633277459436, 102.90357577082252]
    },
    {
        id: 10,
        name: 'Hank Brown',
        phone: '0812345687',
        address: '1050 Srichan Rd, ในเมือง Mueang Khon Kaen District, Khon Kaen 40000',
        customNote: 'Deliver to the back door',
        productList: [
            {
                id: 8,
                name: 'Product 8',
                quantity: 2
            },
            {
                id: 10,
                name: 'Product 10',
                quantity: 1
            }
        ],
        total: 150,
        payment_channels: 'Credit Card',
        status: 'Pending',
        date: '2021-10-19',
        time: '17:00',
        overdue_Balance: 0,
        distance: 800,
        location: [16.472633277459436, 102.90857577082252]
    }
]);

const headers = ref([
    {title: 'Name', key: 'name'},
    {title: 'Total', key: 'total'},
    {title: 'Status', key: 'status'},
    {title: 'Date', key: 'date'},
    {title: 'Distance', key: 'distance'},
    {title: 'Actions', key: 'actions', sortable: false},
]);

const search = ref('');
const searchProps = ref(['name', 'total', 'status', 'date', 'distance']);
const defaultSort = [ { key: "distance", order: "asc", }, ];

const view_more_detail = (item) => {
    console.log('Edit item:', item);
};

const delivered = (item) => {
    console.log('Delete item:', item);
};

</script>

<template>
    <VRow>
        <VCol>
            <VCard>
                <VDataTable
                    :headers="headers"
                    :items="OrderList"
                    :items-per-page="5"
                    :search="search"
                    :search-props="searchProps"
                    :sort-by="defaultSort"
                >
                    <template v-slot:item="{ item }">
                        <tr>
                            <td>{{ item.name }}</td>
                            <td>{{ item.total }}</td>
                            <td>{{ item.status }}</td>
                            <td>{{ item.date }}</td>
                            <td>{{ item.distance }} ม.</td>
                            <td>
                                <div class="actions">
                                    <VBtn color="warning" @click="view_more_detail(item)">แสดงรายละเอียด</VBtn>
                                    <VBtn color="success" @click="delivered(item)">ส่งสินค้า</VBtn>
                                </div>
                            </td>
                        </tr>
                    </template>
                </VDataTable>
            </VCard>
        </VCol>
    </VRow>
</template>

<style scoped lang="scss">
.actions {
    display: flex;
    gap: 10px;
}
</style>
