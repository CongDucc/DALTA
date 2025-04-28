import { userLogin, userRegistration, createAdminUser } from "../controllers/UsersController";
import express, { Request, Response } from "express";
import { USERLOG } from "../models/UserModel";

const router = express.Router();

// In ra log để kiểm tra route được đăng ký
console.log("Đăng ký routes: /registerUser, /loginUser, /createAdmin");

router.post("/registerUser", (req: Request, res: Response) => {
    console.log("Đã nhận yêu cầu đăng ký:", req.body);
    userRegistration(req, res);
});

router.post("/loginUser", (req: Request, res: Response) => {
    console.log("Đã nhận yêu cầu đăng nhập:", req.body);
    userLogin(req, res);
});

router.post("/createAdmin", (req: Request, res: Response) => {
    console.log("Đã nhận yêu cầu tạo admin:", req.body);
    createAdminUser(req, res);
});

// Define handlers separately to avoid TypeScript errors with async functions
const getAllUsers = (req: Request, res: Response) => {
    console.log("Đã nhận yêu cầu lấy tất cả người dùng");
    USERLOG.find({})
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => {
            console.error("Lỗi khi lấy danh sách người dùng:", err);
            res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
        });
};

const getUserById = (req: Request, res: Response) => {
    console.log("Đã nhận yêu cầu lấy thông tin người dùng:", req.params.id);
    USERLOG.findById(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }
            res.status(200).json(user);
        })
        .catch(err => {
            console.error("Lỗi khi lấy thông tin người dùng:", err);
            res.status(500).json({ message: "Lỗi khi lấy thông tin người dùng" });
        });
};

const updateUser = (req: Request, res: Response) => {
    console.log("Đã nhận yêu cầu cập nhật người dùng:", req.params.id);
    const { password, confirmPassword, ...updates } = req.body;
    
    // Only include password if it's provided
    if (password) {
        updates.password = password;
        updates.confirmPassword = confirmPassword;
    }
    
    USERLOG.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
    )
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }
            res.status(200).json({ message: "Cập nhật người dùng thành công", user });
        })
        .catch(err => {
            console.error("Lỗi khi cập nhật người dùng:", err);
            res.status(500).json({ message: "Lỗi khi cập nhật người dùng" });
        });
};

const deleteUser = (req: Request, res: Response) => {
    console.log("Đã nhận yêu cầu xóa người dùng:", req.params.id);
    USERLOG.findByIdAndDelete(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }
            res.status(200).json({ message: "Xóa người dùng thành công" });
        })
        .catch(err => {
            console.error("Lỗi khi xóa người dùng:", err);
            res.status(500).json({ message: "Lỗi khi xóa người dùng" });
        });
};

// Register the routes with the handlers
router.get("/all", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export { router as UserRoute };