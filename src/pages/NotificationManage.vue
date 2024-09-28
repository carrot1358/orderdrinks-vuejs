<template>
    <div>
        <h1>จัดการการแจ้งเตือน</h1>
        <v-btn class="mb-4" color="primary" @click="openCreateDialog"
            >เพิ่มการแจ้งเตือนใหม่</v-btn
        >
        <notification-list ref="listRef" @edit="openEditDialog" />
        <notification-edit
            :dialog="editDialog"
            :item="selectedItem"
            @update:dialog="editDialog = $event"
            @saved="refreshList"
            @deleted="refreshList"
        />
        <notification-create
            :dialog="createDialog"
            @update:dialog="createDialog = $event"
            @created="refreshList"
        />
    </div>
</template>

<script>
import { ref } from "vue";
import NotificationList from "@/views/pages/NotificationManage/notificationList.vue";
import NotificationEdit from "@/views/pages/NotificationManage/notificationEdit.vue";
import NotificationCreate from "@/views/pages/NotificationManage/notificationCreate.vue";

export default {
    name: "NotificationManage",
    components: {
        NotificationList,
        NotificationEdit,
        NotificationCreate,
    },
    setup() {
        const editDialog = ref(false);
        const createDialog = ref(false);
        const selectedItem = ref({});
        const listRef = ref(null);

        const openEditDialog = (item) => {
            selectedItem.value = item;
            editDialog.value = true;
        };

        const openCreateDialog = () => {
            createDialog.value = true;
        };

        const refreshList = () => {
            if (listRef.value) {
                listRef.value.fetchNotifications();
            }
        };

        return {
            editDialog,
            createDialog,
            selectedItem,
            listRef,
            openEditDialog,
            openCreateDialog,
            refreshList,
        };
    },
};
</script>
