"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Plus, 
  Search, 
  Layers,
  Pencil,
  Trash2, 
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  Category, 
  PaginationMeta 
} from "@/services/categories"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [formLoading, setFormLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getCategories({ 
        page, 
        per_page: perPage, 
        search: search || undefined 
      })
      setCategories(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error("Failed to fetch categories", error)
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search])

  // Debounce search or just use effect
  useEffect(() => {
    // Simple debounce could be done here or just fetch
    const timeout = setTimeout(() => {
      fetchCategories()
    }, 300)
    return () => clearTimeout(timeout)
  }, [fetchCategories])

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setCurrentCategory(null)
    setFormLoading(false)
  }

  const handleCreate = async () => {
    setFormLoading(true)
    try {
      await createCategory({
        name: formData.name,
        description: formData.description,
      })
      setIsCreateOpen(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error("Failed to create category", error)
    } finally {
      setFormLoading(false)
    }
  }

  const openEdit = (category: Category) => {
    setCurrentCategory(category)
    setFormData({ 
      name: category.name, 
      description: category.description || "" 
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!currentCategory) return
    setFormLoading(true)
    try {
      await updateCategory(currentCategory.id, {
        name: formData.name,
        description: formData.description,
      })
      setIsEditOpen(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error("Failed to update category", error)
    } finally {
      setFormLoading(false)
    }
  }

  const openDelete = (category: Category) => {
    setCurrentCategory(category)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!currentCategory) return
    setFormLoading(true)
    try {
      await deleteCategory(currentCategory.id)
      setIsDeleteOpen(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error("Failed to delete category", error)
    } finally {
      setFormLoading(false)
    }
  }

  // Generate a consistent color based on name (mocking the UI element)
  const getAvatarColor = (name: string) => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        {/* Header Section */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Category list</h2>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Anything..."
                className="pl-8 bg-background"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1) // Reset to first page on search
                }}
              />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={resetForm}>
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Category</DialogTitle>
                  <DialogDescription>
                    Add a new category for tagging income or expenses.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={formLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={formLoading}>
                    {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] pl-6">
                  {/* <Checkbox /> */}
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6">
                        {/* <Checkbox /> */}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* <div className={`h-8 w-8 rounded-full ${getAvatarColor(category.name)} opacity-20`} /> */}
                          <span className="font-medium cursor-pointer hover:underline">
                            {category.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.description}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDelete(category)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / Pagination Section */}
        <div className="p-4 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={!meta || meta.current_page === 1 || loading}
                onClick={() => setPage(page - 1)}
            >
              <span className="sr-only">Previous page</span>
              &lt;
            </Button>
            <div className="flex gap-1 items-center">
                <span className="text-sm font-medium">
                    Page {meta?.current_page || 1} of {meta?.last_page || 1}
                </span>
            </div>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                disabled={!meta || meta.current_page === meta.last_page || loading}
                onClick={() => setPage(page + 1)}
            >
              <span className="sr-only">Next page</span>
              &gt;
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
                {meta ? `Showing ${meta.from || 0} to ${meta.to || 0} of ${meta.total} entries` : '...'}
            </span>
            <div className="flex items-center gap-2">
              <Select 
                value={String(perPage)} 
                onValueChange={(val) => {
                    setPerPage(Number(val))
                    setPage(1)
                }}
            >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">Show 8</SelectItem>
                  <SelectItem value="15">Show 15</SelectItem>
                  <SelectItem value="50">Show 50</SelectItem>
                  <SelectItem value="100">Show 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold">{currentCategory?.name}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
