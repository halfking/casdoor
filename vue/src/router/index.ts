import { createRouter, createWebHistory } from "vue-router";
import ManagementLayout from "@/layouts/ManagementLayout.vue";
import UserListPage from "@/views/management/UserListPage.vue";
import UserEditPage from "@/views/management/UserEditPage.vue";
import OrganizationListPage from "@/views/management/OrganizationListPage.vue";
import OrganizationEditPage from "@/views/management/OrganizationEditPage.vue";
import ApplicationListPage from "@/views/management/ApplicationListPage.vue";
import ApplicationEditPage from "@/views/management/ApplicationEditPage.vue";
import RoleListPage from "@/views/management/RoleListPage.vue";
import RoleEditPage from "@/views/management/RoleEditPage.vue";
import PermissionListPage from "@/views/management/PermissionListPage.vue";
import PermissionEditPage from "@/views/management/PermissionEditPage.vue";
import ModelListPage from "@/views/management/ModelListPage.vue";
import ModelEditPage from "@/views/management/ModelEditPage.vue";
import ProviderListPage from "@/views/management/ProviderListPage.vue";
import ProviderEditPage from "@/views/management/ProviderEditPage.vue";
import GroupListPage from "@/views/management/GroupListPage.vue";
import GroupEditPage from "@/views/management/GroupEditPage.vue";
import GroupTreePage from "@/views/management/GroupTreePage.vue";
import ProductStorePage from "@/views/management/ProductStorePage.vue";
import CartListPage from "@/views/management/CartListPage.vue";
import ProductBuyPage from "@/views/management/ProductBuyPage.vue";
import OrderPayPage from "@/views/management/OrderPayPage.vue";
import LdapSyncPage from "@/views/management/LdapSyncPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/management/users",
    },
    {
      path: "/management",
      component: ManagementLayout,
      children: [
        { path: "", redirect: { name: "management-users" } },
        { path: "users", name: "management-users", component: UserListPage },
        { path: "users/new", name: "management-users-new", component: UserEditPage },
        { path: "users/:owner/:name", name: "management-users-edit", component: UserEditPage },
        { path: "organizations", name: "management-organizations", component: OrganizationListPage },
        { path: "organizations/new", name: "management-organizations-new", component: OrganizationEditPage },
        { path: "organizations/:name", name: "management-organizations-edit", component: OrganizationEditPage },
        { path: "applications", name: "management-applications", component: ApplicationListPage },
        { path: "applications/new", name: "management-applications-new", component: ApplicationEditPage },
        { path: "applications/:organization/:name", name: "management-applications-edit", component: ApplicationEditPage },
        { path: "roles", name: "management-roles", component: RoleListPage },
        { path: "roles/new", name: "management-roles-new", component: RoleEditPage },
        { path: "roles/:owner/:name", name: "management-roles-edit", component: RoleEditPage },
        { path: "permissions", name: "management-permissions", component: PermissionListPage },
        { path: "permissions/new", name: "management-permissions-new", component: PermissionEditPage },
        { path: "permissions/:owner/:name", name: "management-permissions-edit", component: PermissionEditPage },
        { path: "models", name: "management-models", component: ModelListPage },
        { path: "models/new", name: "management-models-new", component: ModelEditPage },
        { path: "models/:owner/:name", name: "management-models-edit", component: ModelEditPage },
        { path: "providers", name: "management-providers", component: ProviderListPage },
        { path: "providers/new", name: "management-providers-new", component: ProviderEditPage },
        { path: "providers/:owner/:name", name: "management-providers-edit", component: ProviderEditPage },
        { path: "groups", name: "management-groups", component: GroupListPage },
        { path: "groups/new", name: "management-groups-new", component: GroupEditPage },
        { path: "groups/:owner/:name", name: "management-groups-edit", component: GroupEditPage },
        { path: "groups/tree", name: "management-groups-tree", component: GroupTreePage },
        { path: "product-store", name: "management-product-store", component: ProductStorePage },
        { path: "cart", name: "management-cart", component: CartListPage },
        { path: "buy", name: "management-buy", component: ProductBuyPage },
        { path: "order-pay", name: "management-order-pay", component: OrderPayPage },
        { path: "ldap/sync/:organizationName/:ldapId", name: "management-ldap-sync", component: LdapSyncPage },
      ],
    },
  ],
});

export default router;
